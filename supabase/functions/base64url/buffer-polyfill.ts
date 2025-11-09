/**
 * Buffer polyfill for Deno with base64url support
 *
 * IMPORTANT: Supabase Edge Functions runtime doesn't support base64url in node:buffer
 * This polyfill extends Buffer to support base64url encoding, which is required by
 * the Coinbase CDP SDK for JWT creation.
 *
 * Uses Deno's native node:buffer as the base, then extends it with base64url support
 *
 * Usage:
 * ```ts
 * import "buffer-polyfill";
 * // Now Buffer.from(data, "base64url") will work
 * ```
 */

import { Buffer } from "node:buffer";
import { decode, encode } from "./mod.ts";

// Extend Buffer to support base64url encoding
const originalFrom = Buffer.from;

/**
 * Enhanced Buffer.from that supports base64url encoding
 */
Buffer.from = function (
  value: string | Uint8Array | ArrayBuffer,
  encodingOrOffset?: string | number,
  length?: number,
): Buffer {
  // Handle base64url encoding
  if (typeof encodingOrOffset === "string" && encodingOrOffset === "base64url") {
    if (typeof value === "string") {
      // Decode base64url string to Buffer
      const decoded = decode(value);
      return Buffer.from(decoded);
    }
    throw new TypeError(
      'The "value" argument must be a string when encoding is "base64url"',
    );
  }

  // Fall back to original Buffer.from for other encodings
  if (typeof encodingOrOffset === "number") {
    return originalFrom.call(this, value, encodingOrOffset, length);
  }
  return originalFrom.call(this, value, encodingOrOffset);
} as typeof Buffer.from;

// Patch Buffer.prototype.toString to support base64url
const originalToString = Buffer.prototype.toString;
Buffer.prototype.toString = function (
  encoding?: string,
): string {
  if (encoding === "base64url") {
    // Encode Buffer to base64url string
    return encode(new Uint8Array(this));
  }
  return originalToString.call(this, encoding);
};

// Make Buffer available globally
if (typeof globalThis !== "undefined") {
  globalThis.Buffer = Buffer;
}

export { Buffer };

