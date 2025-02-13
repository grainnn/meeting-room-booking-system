import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.user) {
      return true;
    }
    const permissions = request.user.permissions;

    const requiredPermissions = this.reflector.getAllAndOverride(
      'require-permissions',
      [context.getClass(), context.getHandler()]
    );

    if (!requiredPermissions) return true;

    if (!permissions) return false;

    for (let i = 0; i < requiredPermissions.length; i++) {
      const requried_permission = requiredPermissions[i];

      const isValid = permissions?.find(
        (p: any) => p.code === requried_permission
      );
      if (!isValid) {
        throw new UnauthorizedException('您没有访问该接口的权限');
      }
    }

    return true;
  }
}
