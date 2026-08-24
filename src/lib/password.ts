/**
 * Password policy validation (Phase 10.1).
 *
 * Enforces minimum strength for admin passwords:
 *   - Minimum 10 characters
 *   - At least one letter
 *   - At least one digit
 *
 * The bcrypt cost factor is set to 12 (strong, ~250ms per hash).
 */

export const MIN_PASSWORD_LENGTH = 10;
export const BCRYPT_COST = 12;

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

/** Validate a password against the policy. Returns errors in Bengali. */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`পাসওয়ার্ড কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে।`);
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push("পাসওয়ার্ডে কমপক্ষে একটি অক্ষর থাকতে হবে।");
  }
  if (!/\d/.test(password)) {
    errors.push("পাসওয়ার্ডে কমপক্ষে একটি সংখ্যা থাকতে হবে।");
  }

  return { valid: errors.length === 0, errors };
}
