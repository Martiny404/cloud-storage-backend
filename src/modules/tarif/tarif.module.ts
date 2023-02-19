import { Module } from '@nestjs/common';
import { TarifService } from './tarif.service';
import { TarifController } from './tarif.controller';

@Module({
  providers: [TarifService],
  controllers: [TarifController]
})
export class TarifModule {}
