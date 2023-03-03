import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateFileDto {
  @IsOptional()
  @IsNumber(undefined, { message: 'ID родительской папки должно быть числом' })
  @IsPositive({ message: 'ID родительской папки должно быть больше 0' })
  folderId: number;
}
