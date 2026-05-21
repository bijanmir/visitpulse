export type ComplianceMode = "standard" | "hipaa";

export const features = {
  complianceMode: (process.env.COMPLIANCE_MODE ?? "standard") as ComplianceMode,
  visitPrep: process.env.FEATURE_VISIT_PREP !== "false",
  medTimeline: process.env.FEATURE_MED_TIMELINE !== "false",
  auditPersist: process.env.FEATURE_AUDIT_PERSIST === "true",
  realNotifications: process.env.FEATURE_REAL_NOTIFICATIONS === "true",
} as const;
