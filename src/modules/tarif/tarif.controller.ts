import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AppClientRequest } from 'src/common/types/client-request.interface';
import { AuthorizationGuard } from '../token/guards/authorization.guard';
import { CreateTarifDto } from './dto/create-tarif.dto';
import { SubscriptionDto } from './dto/subscription.dto';
import { TarifService } from './tarif.service';

@Controller('tarif')
export class TarifController {
  constructor(private readonly tarifService: TarifService) {}

  @Post('/create')
  async create(@Body() dto: CreateTarifDto) {
    return this.tarifService.create(dto);
  }

  @UseGuards(AuthorizationGuard)
  @Post('/subscription')
  async subscription(
    @Body() dto: SubscriptionDto,
    @Req() req: AppClientRequest,
  ) {
    const userId = req.user.id;
    return this.tarifService.subscription(dto, userId);
  }

  @UseGuards(AuthorizationGuard)
  @Get('/test')
  async t(@Req() req: AppClientRequest) {
    return this.tarifService.checkUserSubscriptionExpires(req.user.id);
  }
}
