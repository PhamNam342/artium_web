import { I18nContext, TranslateOptions } from 'nestjs-i18n';

export function t(key: string, options?: TranslateOptions): string {
  const i18n = I18nContext.current();
  if (!i18n) {
    return key;
  }
  return i18n.t(key, options);
}
