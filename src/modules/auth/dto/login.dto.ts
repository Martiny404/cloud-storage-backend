import { IsString, IsEmail, Length } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Электронная почта должна иметь строковый тип' })
  @IsEmail({}, { message: 'Некорректный формат ввода электронной почты' })
  email: string;

  @IsString({ message: 'Пароль должен иметь строковый тип' })
  @Length(6, undefined, {
    message: 'Длина пароля должна быть не меньше 6 символов!',
  })
  password: string;
}
