import { IsNumber } from 'class-validator';

export class RemoveFilesDto {
  @IsNumber(undefined, { each: true })
  ids: number[];

  @IsNumber()
  folderId: number;
}
