import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(private supabase: SupabaseService) {}

  async findAllForUser(userId: string) {
    const client = this.supabase.getClient();

    // Get boards where user is a member (accepted)
    const { data: memberships } = await client
      .from('board_members')
      .select('board_id, role, status')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (!memberships || memberships.length === 0) return [];

    const boardIds = memberships.map((m) => m.board_id);

    const { data: boards } = await client
      .from('boards')
      .select('*')
      .in('id', boardIds)
      .order('updated_at', { ascending: false });

    // Attach role to each board
    return (boards || []).map((b) => {
      const m = memberships.find((m) => m.board_id === b.id);
      return { ...b, role: m?.role || 'member' };
    });
  }

  async findOne(boardId: string, userId: string) {
    const client = this.supabase.getClient();

    await this.checkMembership(boardId, userId);

    const { data: board } = await client
      .from('boards')
      .select('*')
      .eq('id', boardId)
      .single();

    if (!board) throw new NotFoundException('Board not found');

    // Get columns ordered by position
    const { data: columns } = await client
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true });

    // Get all tasks for all columns
    const columnIds = (columns || []).map((c) => c.id);
    let tasks = [];
    if (columnIds.length > 0) {
      const { data: taskData } = await client
        .from('tasks')
        .select('*')
        .in('column_id', columnIds)
        .order('position', { ascending: true });
      tasks = taskData || [];
    }

    // Get members
    const { data: members } = await client
      .from('board_members')
      .select('user_id, role, users(id, name, email, avatar_url)')
      .eq('board_id', boardId);

    return {
      ...board,
      columns: (columns || []).map((col) => ({
        ...col,
        tasks: tasks.filter((t) => t.column_id === col.id),
      })),
      members: (members || []).map((m) => ({ ...m.users, role: m.role })),
    };
  }

  async create(dto: CreateBoardDto, userId: string) {
    const client = this.supabase.getClient();

    const { data: board, error } = await client
      .from('boards')
      .insert({
        name: dto.name,
        owner_id: userId,
        description: dto.description || '',
        color: dto.color || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Add owner as board member
    await client
      .from('board_members')
      .insert({ board_id: board.id, user_id: userId, role: 'owner', status: 'accepted' });

    return board;
  }

  async update(boardId: string, dto: UpdateBoardDto, userId: string) {
    const client = this.supabase.getClient();
    await this.checkOwnership(boardId, userId);

    const updateData: any = { updated_at: new Date().toISOString() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.color !== undefined) updateData.color = dto.color;

    const { data, error } = await client
      .from('boards')
      .update(updateData)
      .eq('id', boardId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async remove(boardId: string, userId: string) {
    const client = this.supabase.getClient();
    await this.checkOwnership(boardId, userId);

    const { error } = await client.from('boards').delete().eq('id', boardId);
    if (error) throw new Error(error.message);
    return { message: 'Board deleted' };
  }

  private async checkMembership(boardId: string, userId: string) {
    const { data } = await this.supabase
      .getClient()
      .from('board_members')
      .select('id')
      .eq('board_id', boardId)
      .eq('user_id', userId)
      .single();

    if (!data) throw new ForbiddenException('Not a member of this board');
  }

  private async checkOwnership(boardId: string, userId: string) {
    const { data } = await this.supabase
      .getClient()
      .from('boards')
      .select('id')
      .eq('id', boardId)
      .eq('owner_id', userId)
      .single();

    if (!data) throw new ForbiddenException('Only the board owner can do this');
  }
}
