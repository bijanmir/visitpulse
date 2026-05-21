import { features } from "@/lib/features";

export class ClinicalDataGuard {
  assertCanPersistPhi(): void {
    if (features.complianceMode !== "hipaa") {
      return;
    }
    // Future: verify BAA vendors, MFA, etc.
  }

  assertCanSendExternalNotification(): void {
    if (features.complianceMode === "hipaa" && !features.realNotifications) {
      throw new Error(
        "External notifications disabled until HIPAA notification providers are configured.",
      );
    }
  }
}

export const clinicalGuard = new ClinicalDataGuard();
