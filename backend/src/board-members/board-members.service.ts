import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { InviteMemberDto } from './dto/invite-member.dto';

@Injectable()
export class BoardMembersService {
  constructor(private supabase: SupabaseService) {}

  async invite(boardId: string, dto: InviteMemberDto, inviterId: string) {
    const client = this.supabase.getClient();

    // Check inviter is a member
    await this.checkMembership(boardId, inviterId);

    // Find user by email
    const { data: user } = await client
      .from('users')
      .select('id, name, email')
      .eq('email', dto.email)
      .single();

    if (!user) throw new NotFoundException('User not found with this email');

    // Check if already a member or pending
    const { data: existing } = await client
      .from('board_members')
      .select('id, status')
      .eq('board_id', boardId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      if (existing.status === 'accepted') {
        throw new ConflictException('User is already a member');
      } else {
        throw new ConflictException('Invitation already sent');
      }
    }

    // Create pending invitation
    const { data, error } = await client
      .from('board_members')
      .insert({ board_id: boardId, user_id: user.id, role: 'member', status: 'pending' })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Get board name and inviter name for notification
    const { data: board } = await client.from('boards').select('name').eq('id', boardId).single();
    const { data: inviter } = await client.from('users').select('name').eq('id', inviterId).single();

    // Create invitation notification
    await client.from('notifications').insert({
      user_id: user.id,
      message: `${inviter?.name || 'Someone'} invited you to board "${board?.name || 'a board'}"`,
      board_id: boardId,
      type: 'invitation',
    });

    return { ...data, user };
  }

  async acceptInvitation(boardId: string, userId: string) {
    const client = this.supabase.getClient();

    const { data: membership } = await client
      .from('board_members')
      .select('id, status')
      .eq('board_id', boardId)
      .eq('user_id', userId)
      .single();

    if (!membership) throw new NotFoundException('No invitation found');
    if (membership.status === 'accepted') throw new ConflictException('Already accepted');

    const { data, error } = await client
      .from('board_members')
      .update({ status: 'accepted' })
      .eq('board_id', boardId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async rejectInvitation(boardId: string, userId: string) {
    const client = this.supabase.getClient();

    const { data: membership } = await client
      .from('board_members')
      .select('id, status')
      .eq('board_id', boardId)
      .eq('user_id', userId)
      .single();

    if (!membership) throw new NotFoundException('No invitation found');

    await client
      .from('board_members')
      .delete()
      .eq('board_id', boardId)
      .eq('user_id', userId);

    return { message: 'Invitation rejected' };
  }

  async findAll(boardId: string, userId: string) {
    const client = this.supabase.getClient();
    await this.checkMembership(boardId, userId);

    const { data } = await client
      .from('board_members')
      .select('user_id, role, status, users(id, name, email, avatar_url)')
      .eq('board_id', boardId)
      .eq('status', 'accepted');

    return (data || []).map((m: any) => ({ ...m.users, role: m.role, status: m.status }));
  }

  async findAllIncludingPending(boardId: string, userId: string) {
    const client = this.supabase.getClient();
    await this.checkMembership(boardId, userId);

    const { data } = await client
      .from('board_members')
      .select('user_id, role, status, users(id, name, email, avatar_url)')
      .eq('board_id', boardId);

    return (data || []).map((m: any) => ({ ...m.users, role: m.role, status: m.status }));
  }

  async getPendingInvitations(userId: string) {
    const client = this.supabase.getClient();

    const { data } = await client
      .from('board_members')
      .select('board_id, role, status, boards(id, name)')
      .eq('user_id', userId)
      .eq('status', 'pending');

    return (data || []).map((m: any) => ({
      board_id: m.board_id,
      board_name: m.boards?.name,
      role: m.role,
      status: m.status,
    }));
  }

  async remove(boardId: string, targetUserId: string, requesterId: string) {
    const client = this.supabase.getClient();

    // Only owner can remove members
    const { data: board } = await client
      .from('boards')
      .select('owner_id')
      .eq('id', boardId)
      .single();

    if (!board || board.owner_id !== requesterId) {
      throw new ForbiddenException('Only the board owner can remove members');
    }

    if (targetUserId === requesterId) {
      throw new ForbiddenException('Cannot remove yourself');
    }

    await client
      .from('board_members')
      .delete()
      .eq('board_id', boardId)
      .eq('user_id', targetUserId);

    return { message: 'Member removed' };
  }

  async updateRole(boardId: string, targetUserId: string, role: string, requesterId: string) {
    const client = this.supabase.getClient();

    // Only owner can change roles
    const { data: board } = await client
      .from('boards')
      .select('owner_id')
      .eq('id', boardId)
      .single();

    if (!board || board.owner_id !== requesterId) {
      throw new ForbiddenException('Only the board owner can change roles');
    }

    const { data, error } = await client
      .from('board_members')
      .update({ role })
      .eq('board_id', boardId)
      .eq('user_id', targetUserId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
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
}
