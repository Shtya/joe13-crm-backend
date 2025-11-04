import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorators';
import { Role } from 'src/user/user-entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false; // Not authenticated
    if (!requiredRoles || requiredRoles.length === 0) return true; // No roles required

    const userRole = user.role?.toString().toLowerCase();
    const normalizedRequiredRoles = requiredRoles.map((r) => r.toString().toLowerCase());

    

    if (!normalizedRequiredRoles.includes(userRole)) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
