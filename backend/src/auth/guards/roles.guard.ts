import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException, // 401
  ForbiddenException, // 403
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // @Roles() 데코레이터에서 설정한 권한 목록
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles)
      return true;

    const request = context.switchToHttp().getRequest();
    const session = request.session;

    if (!session || !session.account)
      throw new UnauthorizedException(); // 401

    const hasRole = requiredRoles.includes(session.account);
    if (!hasRole)
      throw new ForbiddenException(); // 403

    return true;
  }
}