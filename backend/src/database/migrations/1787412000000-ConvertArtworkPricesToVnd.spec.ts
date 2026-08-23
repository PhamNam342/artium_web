import { QueryRunner } from 'typeorm';
import { ConvertArtworkPricesToVnd1787412000000 } from './1787412000000-ConvertArtworkPricesToVnd';

describe('ConvertArtworkPricesToVnd migration', () => {
  it('restores only rows captured by the migration', async () => {
    const queries: string[] = [];
    const queryRunner = {
      query: jest.fn((query: string) => {
        queries.push(query);
      }),
    } as unknown as QueryRunner;

    await new ConvertArtworkPricesToVnd1787412000000().down(queryRunner);

    expect(queries.join('\n')).toContain('artwork_price_vnd_migration_backup');
    expect(queries.join('\n')).toContain('order_price_vnd_migration_backup');
  });
});
