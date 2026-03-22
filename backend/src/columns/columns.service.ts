import { Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private supabase: SupabaseService) {}

  async create(dto: CreateColumnDto, userId: string) {
    const client = this.supabase.getClient();
    await this.checkBoardMembership(dto.board_id, userId);

    // Get max position
    const { data: cols } = await client
      .from('columns')
      .select('position')
      .eq('board_id', dto.board_id)
      .order('position', { ascending: false })
      .limit(1);

    const nextPos = cols && cols.length > 0 ? cols[0].position + 1 : 0;

    const { data, error } = await client
      .from('columns')
      .insert({ name: dto.name, board_id: dto.board_id, position: nextPos })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(columnId: string, dto: UpdateColumnDto, userId: string) {
    const client = this.supabase.getClient();

    const col = await this.getColumnWithBoardCheck(columnId, userId);

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.position !== undefined) updateData.position = dto.position;

    const { data, error } = await client
      .from('columns')
      .update(updateData)
      .eq('id', columnId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async remove(columnId: string, userId: string) {
    const client = this.supabase.getClient();
    await this.getColumnWithBoardCheck(columnId, userId);

    const { error } = await client.from('columns').delete().eq('id', columnId);
    if (error) throw new Error(error.message);
    return { message: 'Column deleted' };
  }

  private async getColumnWithBoardCheck(columnId: string, userId: string) {
    const client = this.supabase.getClient();
    const { data: col } = await client
      .from('columns')
      .select('*, boards(owner_id)')
      .eq('id', columnId)
      .single();

    if (!col) throw new Error('Column not found');
    await this.checkBoardMembership(col.board_id, userId);
    return col;
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
