import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppClientRequest } from 'src/common/types/client-request.interface';

@Injectable()
export class ActivatedGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AppClientRequest>();
    const user = request.user;
    return user.isActivated;
  }
}
