import { IsString, Length } from 'class-validator';

export class RoleDto {
	@IsString({ message: 'Роль должна иметь строковый тип!' })
	@Length(3, undefined, {
		message: 'Длина роли не менее 3 символов!',
	})
	title: string;
}
