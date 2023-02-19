import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateFolderDto {
  @IsString({ message: 'Название папки должно быть строкой' })
  name: string;

  @IsOptional()
  @IsNumber(undefined, { message: 'ID родительской папки должно быть числом' })
  @IsPositive({ message: 'ID родительской папки должно быть больше 0' })
  parentId?: number;
}
