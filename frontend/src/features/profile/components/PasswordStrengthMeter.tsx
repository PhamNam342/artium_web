import { useI18n } from '../../../i18n/I18nContext';
import {
  getPasswordStrength,
  STRENGTH_COLORS,
  type PasswordStrengthLevel,
} from '../../auth/utils/passwordStrength';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { t } = useI18n();
  const strength = getPasswordStrength(password);

  if (!password) return null;

  const levelKey = strength.level as PasswordStrengthLevel;

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${STRENGTH_COLORS[levelKey]}`}
          style={{ width: `${strength.percent}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">
        {t(`profile.passwordStrength.${levelKey}`)}
      </p>
    </div>
  );
}
