import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AdminDeleteArtworkDto } from './admin-delete-artwork.dto';

describe('AdminDeleteArtworkDto', () => {
  it('accepts an optional deletion reason', async () => {
    const dto = plainToInstance(AdminDeleteArtworkDto, {
      reason: 'Violates the platform guidelines.',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects a non-string or overly long deletion reason', async () => {
    const invalidType = plainToInstance(AdminDeleteArtworkDto, { reason: 123 });
    const tooLong = plainToInstance(AdminDeleteArtworkDto, {
      reason: 'a'.repeat(501),
    });

    await expect(validate(invalidType)).resolves.toHaveLength(1);
    await expect(validate(tooLong)).resolves.toHaveLength(1);
  });
});
