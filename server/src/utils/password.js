/**
 * Validates a password against the site's policy.
 * Returns { valid: true } or { valid: false, message: '...' }.
 */
export function validatePasswordPolicy(password, { email = '', fullName = '' } = {}) {
  if (!password || password.length < 12) {
    return { valid: false, message: 'Password must be at least 12 characters.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }

  // Reject passwords that contain the user's email username or full name
  const emailUser = email.split('@')[0].toLowerCase();
  const nameParts = fullName.toLowerCase().split(/\s+/).filter(p => p.length > 2);
  const lower = password.toLowerCase();

  if (emailUser && emailUser.length > 2 && lower.includes(emailUser)) {
    return { valid: false, message: 'Password must not contain your email address.' };
  }

  for (const part of nameParts) {
    if (lower.includes(part)) {
      return { valid: false, message: 'Password must not contain your name.' };
    }
  }

  return { valid: true, message: null };
}
