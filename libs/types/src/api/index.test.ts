import { safeParse, unsafeParse } from '..';
import { ErrorsResponseSchema, OkResponseSchema } from '.';

test('OkResponse', () => {
  unsafeParse(OkResponseSchema, { status: 'ok' });
  safeParse(OkResponseSchema, {}).unsafeUnwrapErr();
});

test('ErrorsResponse', () => {
  unsafeParse(ErrorsResponseSchema, {
    status: 'error',
    errors: [],
  });
  safeParse(ErrorsResponseSchema, { status: 'ok' }).unsafeUnwrapErr();
});
