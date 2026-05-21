import { features } from "@/lib/features";
import type { AuditEvent } from "./types";

export interface AuditLogger {
  log(event: AuditEvent): Promise<void>;
}

class NoopAuditLogger implements AuditLogger {
  async log(_event: AuditEvent): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      // IDs only — never PHI in logs
    }
  }
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
