import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Bạn cần đăng nhập để thực hiện chức năng này');
    }

    // Admin bypasses all role and node-level checks
    if (user.role === RoleName.ADMIN) {
      return true;
    }

    // Check if user role is permitted
    const isRolePermitted = requiredRoles.includes(user.role as RoleName);
    if (!isRolePermitted) {
      throw new ForbiddenException('Bạn không có quyền thực hiện chức năng này');
    }

    // Node-level check: Enforce that non-Admin users can only operate within their assigned node boundary
    if (user.nodeId) {
      const body = request.body || {};
      const params = request.params || {};
      const query = request.query || {};

      // Candidate request fields that specify a Node
      const nodeFields = [
        'nodeId',
        'node_id',
        'sourceNodeId',
        'source_node_id',
        'originNodeId',
        'origin_node_id',
      ];

      for (const field of nodeFields) {
        const requestNodeId = body[field] || params[field] || query[field];
        if (requestNodeId && requestNodeId !== user.nodeId) {
          throw new ForbiddenException(
            `Bạn không có quyền thao tác trên Node khác. Node của bạn: ${user.nodeId}, Node yêu cầu: ${requestNodeId}`,
          );
        }
      }
    }

    return true;
  }
}
