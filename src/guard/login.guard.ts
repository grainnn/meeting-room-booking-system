import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject()
  private reflactor: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // 无需登录
    const require_login = this.reflactor.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler()
    ]);
    if (!require_login) {
      return true;
    }

    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new UnauthorizedException('用户未登录');
    }

    try {
      const token = authorization.split(' ')[1];
      const data = this.jwtService.verify(token);

      request.user = {
        userId: data.userId,
        username: data.username
      };

      return true;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('用户未登录');
    }
  }
}
