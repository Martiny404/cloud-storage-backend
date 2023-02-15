import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AppClientRequest } from 'src/common/types/client-request.interface';
import { matchUserRoles } from 'src/common/utils/match-user-roles';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AppClientRequest>();
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const user = request.user;
    if (!roles) {
      return true;
    }
    return matchUserRoles(roles, user.roles);
  }
}
