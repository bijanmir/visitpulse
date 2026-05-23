/**
 * ID and token generation. Uses Web Crypto where available so check-in tokens
 * are not guessable from `Math.random()`. Falls back to a less-secure path only
 * in environments without Web Crypto (older SSR runtimes).
 */

function randomBytesHex(length: number): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Last-resort fallback; not cryptographically secure.
  let hex = "";
  for (let i = 0; i < length; i++) {
    hex += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");
  }
  return hex;
}

export function newUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return randomBytesHex(16);
}

export function newPatientId(): string {
  return `pt-${newUuid()}`;
}

export function newCheckInId(): string {
  return `ci-${newUuid()}`;
}

export function newMedEventId(): string {
  return `med-${newUuid()}`;
}

/** 128-bit hex token, URL-safe, prefixed for readability. */
export function newCheckInToken(slug: string): string {
  return `checkin-${slug}-${randomBytesHex(16)}`;
}
