import { prisma } from '../config/prisma.js';

export interface AuditLogParams {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
}

export const recordAuditLog = async (params: AuditLogParams) => {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: params.details || undefined,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('[Audit Log] Failed to record audit log:', error);
    return null;
  }
};

