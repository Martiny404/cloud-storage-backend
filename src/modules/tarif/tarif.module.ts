import { Module } from '@nestjs/common';
import { TarifService } from './tarif.service';
import { TarifController } from './tarif.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarif } from './entities/tarif.entity';
import { UserTarifs } from './entities/user-tarifs.entity';

@Module({
  providers: [TarifService],
  controllers: [TarifController],
  imports: [TypeOrmModule.forFeature([Tarif, UserTarifs])],
})
export class TarifModule {}
