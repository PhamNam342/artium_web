import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

describe('CreateOrderDto', () => {
  it.each([undefined, {}])(
    'requires a complete shipping address (%s)',
    async (shippingAddress) => {
      const dto = plainToInstance(CreateOrderDto, {
        artworkId: '123e4567-e89b-12d3-a456-426614174000',
        ...(shippingAddress === undefined ? {} : { shippingAddress }),
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('shippingAddress');
      if (shippingAddress) {
        expect(errors[0].children?.length).toBeGreaterThan(0);
      }
    },
  );
});
