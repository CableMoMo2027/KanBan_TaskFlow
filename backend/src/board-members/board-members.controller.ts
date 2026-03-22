import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId/members')
export class BoardMembersController {
  constructor(private boardMembersService: BoardMembersService) {}

  @Get()
  findAll(@Param('boardId') boardId: string, @Request() req: any) {
    return this.boardMembersService.findAll(boardId, req.user.id);
  }

  @Get('all')
  findAllIncludingPending(@Param('boardId') boardId: string, @Request() req: any) {
    return this.boardMembersService.findAllIncludingPending(boardId, req.user.id);
  }

  @Post()
  invite(
    @Param('boardId') boardId: string,
    @Body() dto: InviteMemberDto,
    @Request() req: any,
  ) {
    return this.boardMembersService.invite(boardId, dto, req.user.id);
  }

  @Post('accept')
  accept(@Param('boardId') boardId: string, @Request() req: any) {
    return this.boardMembersService.acceptInvitation(boardId, req.user.id);
  }

  @Post('reject')
  reject(@Param('boardId') boardId: string, @Request() req: any) {
    return this.boardMembersService.rejectInvitation(boardId, req.user.id);
  }

  @Patch(':userId/role')
  updateRole(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @Body('role') role: string,
    @Request() req: any,
  ) {
    return this.boardMembersService.updateRole(boardId, userId, role, req.user.id);
  }

  @Delete(':userId')
  remove(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    return this.boardMembersService.remove(boardId, userId, req.user.id);
  }
}
