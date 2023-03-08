import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TARIF_NAME_DUPLICATE,
  TARIF_NOT_FOUND,
  TARIF_SLUG_DUPLICATE,
} from 'src/common/constants/errors/tarif.errors';
import { USER_NOT_FOUND } from 'src/common/constants/errors/user.errors';
import { LessThanOrEqual, Repository } from 'typeorm';
import { UserService } from '../user/services/user.service';
import { CreateTarifDto } from './dto/create-tarif.dto';
import { Tarif } from './entities/tarif.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionDto } from './dto/subscription.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TarifService {
  constructor(
    @InjectRepository(Tarif)
    private readonly tarifRepository: Repository<Tarif>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly userService: UserService,
  ) {}
  async create({ disk, monthlyPrice, name, slug }: CreateTarifDto) {
    const isTarifNameExist = await this.tarifRepository.findOne({
      where: { name },
    });
    if (isTarifNameExist) {
      throw new BadRequestException(TARIF_NAME_DUPLICATE);
    }
    const isTarifSlugExist = await this.getTarifBySlug(slug);
    if (isTarifSlugExist) {
      throw new BadRequestException(TARIF_SLUG_DUPLICATE);
    }
    const newTarif = this.tarifRepository.create({
      disk,
      name,
      monthlyPrice,
      slug: slug.toUpperCase(),
    });
    return this.tarifRepository.save(newTarif);
  }

  async getTarifBySlug(slug: string) {
    return this.tarifRepository.findOne({
      where: {
        slug: slug.toUpperCase(),
      },
    });
  }

  async subscription(dto: SubscriptionDto, userId: number) {
    const tarif = await this.tarifRepository.findOne({
      where: { id: dto.tarifId },
    });
    if (!tarif) {
      throw new NotFoundException(TARIF_NOT_FOUND);
    }
    const user = await this.userService.findOneBy({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    const notExipers = await this.checkUserSubscriptionExpires(user.id);

    if (!notExipers) {
      throw new BadRequestException('Есть активная подписка!');
    }

    const s = this.subscriptionRepository.create({
      monthes: dto.monthes,
      tarif: { id: dto.tarifId },
      user: { id: userId },
    });
    return this.subscriptionRepository.save(s);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkUsersSubscriptions() {
    await this.subscriptionRepository.update(
      {
        isActive: true,
        endDate: LessThanOrEqual(new Date()),
      },
      {
        isActive: false,
      },
    );
  }

  async checkUserSubscriptionExpires(userId: number) {
    const sub = await this.subscriptionRepository.findOne({
      where: { user: { id: userId }, isActive: true },
    });

    if (!sub) {
      return true;
    }

    if (new Date() >= sub.endDate) {
      sub.isActive = false;
      this.subscriptionRepository.save(sub);
      return false;
    }
    return true;
  }
}
