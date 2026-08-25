import type { ValidationArguments } from 'class-validator';
import { t } from './i18n.util';

/**
 * Builds localized class-validator messages for artwork-folder request DTOs.
 */
export const artworkFolderValidationMessage =
  (key: string, args: Record<string, string | number> = {}) =>
  (validationArguments: ValidationArguments): string =>
    t(`artwork_folder.validation.${key}`, {
      args: {
        field: validationArguments.property,
        ...args,
      },
    });
