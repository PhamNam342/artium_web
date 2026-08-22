export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrength {
  score: number;
  level: PasswordStrengthLevel;
  percent: number;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, level: 'weak', percent: 0 };
  }

  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const level: PasswordStrengthLevel =
    score <= 1 ? 'weak' : score === 2 ? 'fair' : score === 3 ? 'good' : 'strong';

  const percent = Math.min(100, Math.round((score / 5) * 100));

  return { score, level, percent };
}

export const STRENGTH_COLORS: Record<PasswordStrengthLevel, string> = {
  weak: 'bg-red-500',
  fair: 'bg-orange-400',
  good: 'bg-yellow-400',
  strong: 'bg-green-500',
};
