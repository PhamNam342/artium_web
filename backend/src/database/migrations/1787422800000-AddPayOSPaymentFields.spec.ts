import { QueryRunner } from 'typeorm';
import { AddPayOSPaymentFields1787422800000 } from './1787422800000-AddPayOSPaymentFields';

describe('AddPayOSPaymentFields migration', () => {
  it('adds and removes the PayOS payment columns and sequence', async () => {
    const queries: string[] = [];
    const queryRunner = {
      query: jest.fn((query: string) => {
        queries.push(query);
      }),
    } as unknown as QueryRunner;
    const migration = new AddPayOSPaymentFields1787422800000();

    await migration.up(queryRunner);
    expect(queries.join('\n')).toContain('payos_order_code');
    expect(queries.join('\n')).toContain('orders_payos_order_code_seq');

    queries.length = 0;
    await migration.down(queryRunner);
    expect(queries.join('\n')).toContain('DROP SEQUENCE');
    expect(queries.join('\n')).toContain('payment_reference');
  });
});
