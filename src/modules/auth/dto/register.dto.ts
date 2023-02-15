import { IsString, Length } from 'class-validator';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @IsString({ message: 'Ник должен иметь строковый тип' })
  @Length(3, undefined, {
    message: 'Длина ника должна быть не меньше 3 символов!',
  })
  nickName: string;
}
