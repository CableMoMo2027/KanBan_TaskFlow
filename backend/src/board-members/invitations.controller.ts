import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BoardMembersService } from '../board-members/board-members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private boardMembersService: BoardMembersService) {}

  @Get('pending')
  getPending(@Request() req: any) {
    return this.boardMembersService.getPendingInvitations(req.user.id);
  }

  @Post(':boardId/accept')
  accept(@Param('boardId') boardId: string, @Request() req: any) {
    return this.boardMembersService.acceptInvitation(boardId, req.user.id);
  }

  @Post(':boardId/reject')
  reject(@Param('boardId') boardId: string, @Request() req: any) {
    return this.boardMembersService.rejectInvitation(boardId, req.user.id);
  }
}
