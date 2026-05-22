import { features } from "@/lib/features";
import type { AuditEvent } from "./types";

export interface AuditLogger {
  log(event: AuditEvent): Promise<void>;
}

class NoopAuditLogger implements AuditLogger {
  // No-op until a real audit sink is configured (see SAFETY.md).
  async log(): Promise<void> {}
}

class ConsoleAuditLogger implements AuditLogger {
  async log(event: AuditEvent): Promise<void> {
    console.info("[audit]", {
      action: event.action,
      actorId: event.actorId,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
    });
  }
}

export const auditLogger: AuditLogger = features.auditPersist
  ? new ConsoleAuditLogger()
  : new NoopAuditLogger();
