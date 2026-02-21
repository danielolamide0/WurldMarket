import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/** True if the stored value looks like a bcrypt hash (so we don't treat it as legacy plain text). */
export function isBcryptHash(stored: string | undefined | null): boolean {
  if (typeof stored !== 'string') return false
  return stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')
}

/** Hash a password for storage. Use for signup, reset password, and when migrating legacy plain text. */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS)
}

/**
 * Verify password against stored value (hash or legacy plain text).
 * If legacy plain text matches, returns { match: true, migrate: true } so caller can hash and update.
 */
export async function verifyPassword(
  inputPassword: string,
  storedPassword: string | undefined | null
): Promise<{ match: boolean; migrate: boolean }> {
  if (storedPassword == null || storedPassword === '') {
    return { match: false, migrate: false }
  }

  const stored = String(storedPassword)
  const input = String(inputPassword)

  if (isBcryptHash(stored)) {
    const match = await bcrypt.compare(input, stored)
    return { match, migrate: false }
  }

  // Legacy plain text
  const match =
    stored === input || stored.trim() === input.trim()
  return { match, migrate: match }
}
