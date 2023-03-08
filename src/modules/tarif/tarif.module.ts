import { Module } from '@nestjs/common';
import { TarifService } from './tarif.service';
import { TarifController } from './tarif.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarif } from './entities/tarif.entity';
import { Subscription } from './entities/subscription.entity';
import { UserModule } from '../user/user.module';

@Module({
  providers: [TarifService],
  controllers: [TarifController],
  imports: [TypeOrmModule.forFeature([Tarif, Subscription]), UserModule],
  exports: [TarifService],
})
export class TarifModule {}
