import { IsNumber, IsPositive } from 'class-validator';

export class AddRoleDto {
  @IsNumber(undefined, {
    message:
      'ID роли должен иметь числовой тип данных и являться целым числом!',
  })
  @IsPositive({ message: 'ID роли должен быть больше нуля!' })
  roleId: number;
}
