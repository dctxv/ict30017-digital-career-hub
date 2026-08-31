const EMAIL_MAX = 254;
const LINKEDIN_MAX = 500;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function optionalText(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

export function validateAlumniContacts({ email, linkedin_url } = {}) {
  const normalizedEmail = optionalText(email);
  if (normalizedEmail) {
    if (normalizedEmail.length > EMAIL_MAX || !EMAIL_PATTERN.test(normalizedEmail)) {
      return 'Email must be a valid email address.';
    }
  }

  const normalizedLinkedIn = optionalText(linkedin_url);
  if (normalizedLinkedIn) {
    if (normalizedLinkedIn.length > LINKEDIN_MAX) {
      return `LinkedIn URL must be ${LINKEDIN_MAX} characters or fewer.`;
    }
    try {
      const url = new URL(normalizedLinkedIn);
      const host = url.hostname.toLowerCase();
      if (url.protocol !== 'https:' || (host !== 'linkedin.com' && !host.endsWith('.linkedin.com'))) {
        return 'LinkedIn URL must be a valid https://linkedin.com address.';
      }
    } catch {
      return 'LinkedIn URL must be a valid https://linkedin.com address.';
    }
  }

  return null;
}

