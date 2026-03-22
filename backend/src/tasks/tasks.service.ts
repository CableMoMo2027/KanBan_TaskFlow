import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@Injectable()
export class TasksService {
  constructor(private supabase: SupabaseService) {}

  async findMyTasks(userId: string) {
    const client = this.supabase.getClient();

    const { data: tasks } = await client
      .from('tasks')
      .select('*, columns(id, name, board_id, boards(id, name))')
      .eq('assignee_id', userId)
      .order('updated_at', { ascending: false });

    return (tasks || []).map((t: any) => ({
      ...t,
      column_name: t.columns?.name,
      board_id: t.columns?.board_id,
      board_name: t.columns?.boards?.name,
      columns: undefined,
    }));
  }

  async create(dto: CreateTaskDto, userId: string) {
    const client = this.supabase.getClient();

    // Get board_id from column
    const { data: col } = await client
      .from('columns')
      .select('board_id')
      .eq('id', dto.column_id)
      .single();

    if (!col) throw new NotFoundException('Column not found');
    await this.checkBoardMembership(col.board_id, userId);
    if (dto.assignee_id) {
      await this.checkBoardMembership(col.board_id, dto.assignee_id);
    }

    // Get max position in column
    const { data: tasks } = await client
      .from('tasks')
      .select('position')
      .eq('column_id', dto.column_id)
      .order('position', { ascending: false })
      .limit(1);

    const nextPos = tasks && tasks.length > 0 ? tasks[0].position + 1 : 0;

    const { data, error } = await client
      .from('tasks')
      .insert({
        title: dto.title,
        description: dto.description || '',
        column_id: dto.column_id,
        position: nextPos,
        tags: dto.tags || [],
        assignee_id: dto.assignee_id || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (dto.assignee_id && dto.assignee_id !== userId) {
      const { data: assigner } = await client
        .from('users')
        .select('name')
        .eq('id', userId)
        .single();

      await client.from('notifications').insert({
        user_id: dto.assignee_id,
        message: `${assigner?.name || 'Someone'} assigned you to task "${dto.title}"`,
        board_id: col.board_id,
        task_id: data.id,
        type: 'assignment',
      });
    }

    return data;
  }

  async findOne(taskId: string, userId: string) {
    const client = this.supabase.getClient();

    const { data: task } = await client
      .from('tasks')
      .select('*, columns(board_id)')
      .eq('id', taskId)
      .single();

    if (!task) throw new NotFoundException('Task not found');
    await this.checkBoardMembership(task.columns.board_id, userId);

    // Get assignee info if assigned
    let assignee = null;
    if (task.assignee_id) {
      const { data: user } = await client
        .from('users')
        .select('id, name, email, avatar_url')
        .eq('id', task.assignee_id)
        .single();
      assignee = user;
    }

    return { ...task, assignee, columns: undefined, board_id: task.columns.board_id };
  }

  async update(taskId: string, dto: UpdateTaskDto, userId: string) {
    const client = this.supabase.getClient();

    const { data: task } = await client
      .from('tasks')
      .select('*, columns(board_id)')
      .eq('id', taskId)
      .single();

    if (!task) throw new NotFoundException('Task not found');
    await this.checkBoardMembership(task.columns.board_id, userId);

    const updateData: any = { updated_at: new Date().toISOString() };
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.status !== undefined) updateData.status = dto.status;

    const { data, error } = await client
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async move(taskId: string, dto: MoveTaskDto, userId: string) {
    const client = this.supabase.getClient();

    const { data: task } = await client
      .from('tasks')
      .select('*, columns(board_id)')
      .eq('id', taskId)
      .single();

    if (!task) throw new NotFoundException('Task not found');
    await this.checkBoardMembership(task.columns.board_id, userId);

    const { data, error } = await client
      .from('tasks')
      .update({
        column_id: dto.column_id,
        position: dto.position,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async assign(taskId: string, assigneeId: string | null, userId: string) {
    const client = this.supabase.getClient();

    const { data: task } = await client
      .from('tasks')
      .select('*, columns(board_id)')
      .eq('id', taskId)
      .single();

    if (!task) throw new NotFoundException('Task not found');
    await this.checkBoardMembership(task.columns.board_id, userId);

    const { data, error } = await client
      .from('tasks')
      .update({ assignee_id: assigneeId, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Create notification if assigning someone
    if (assigneeId && assigneeId !== userId) {
      const { data: assigner } = await client
        .from('users')
        .select('name')
        .eq('id', userId)
        .single();

      await client.from('notifications').insert({
        user_id: assigneeId,
        message: `${assigner?.name || 'Someone'} assigned you to task "${task.title}"`,
        board_id: task.columns.board_id,
        task_id: taskId,
        type: 'assignment',
      });
    }

    return data;
  }

  async remove(taskId: string, userId: string) {
    const client = this.supabase.getClient();

    const { data: task } = await client
      .from('tasks')
      .select('*, columns(board_id)')
      .eq('id', taskId)
      .single();

    if (!task) throw new NotFoundException('Task not found');
    await this.checkBoardMembership(task.columns.board_id, userId);

    const { error } = await client.from('tasks').delete().eq('id', taskId);
    if (error) throw new Error(error.message);
    return { message: 'Task deleted' };
  }

  private async checkBoardMembership(boardId: string, userId: string) {
    const { data } = await this.supabase
      .getClient()
      .from('board_members')
      .select('id')
      .eq('board_id', boardId)
      .eq('user_id', userId)
      .single();

    if (!data) throw new ForbiddenException('Not a member of this board');
  }
}
