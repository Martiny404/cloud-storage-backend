import { IsString } from 'class-validator';

export class RemoveFilesDto {
  @IsString({ each: true })
  paths: string[];
}
