import { UserEntity } from '../../users/entities/user.entity';
export declare class AuditLogEntity {
    id: string;
    actorId: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    oldValues: any;
    newValues: any;
    ipAddress: string | null;
    userAgent: string | null;
    occurredAt: Date;
    actor: UserEntity | null;
}
