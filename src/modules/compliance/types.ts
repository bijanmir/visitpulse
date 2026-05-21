export type AuditAction =
  | "patient.view"
  | "patient.create"
  | "prep.view"
  | "timeline.view"
  | "checkin.submit";

export type AuditEvent = {
  action: AuditAction;
  actorId: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, string>;
};
