import { IsInt, IsUUID } from 'class-validator';

export class MoveTaskDto {
  @IsUUID()
  column_id!: string;

  @IsInt()
  position!: number;
}
