import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppClientRequest } from 'src/common/types/client-request.interface';
import { TarifService } from '../tarif.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly tarifService: TarifService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AppClientRequest>();
    const user = request.user;
    return this.tarifService.checkUserSubscriptionExpires(user.id);
  }
}
