import { IsNumber, IsPositive, IsString, Length } from 'class-validator';

export class CreateTarifDto {
  @IsString({ message: 'Название тарифа должно быть строкой!' })
  @Length(3)
  name: string;
  @IsString({ message: 'Уникальное имя должно быть строкой!' })
  @Length(3)
  slug: string;
  @IsNumber(undefined, { message: 'Цена за месяц должна быть числом!' })
  @IsPositive()
  monthlyPrice: number;
  @IsNumber(undefined, { message: 'Объем хранилища должен быть числом!' })
  @IsPositive()
  disk: number;
}
