import { isCardReturn, readCardReturn } from './card-return';

const RETURN = 'https://wp-membership-system.com/pay/return';

describe('card return URL', () => {
  it('reads sid and checkout_id from the redirect Sifalo and the API build', () => {
    expect(
      readCardReturn(
        `${RETURN}?checkout_id=eed52f81-cc5c-4c7d-9fe7-b02c2bba2a12&sid=abc123`,
        RETURN
      )
    ).toEqual({ checkoutId: 'eed52f81-cc5c-4c7d-9fe7-b02c2bba2a12', sid: 'abc123' });
  });

  it('does not care about parameter order, encoding or a trailing slash', () => {
    expect(readCardReturn(`${RETURN}/?sid=a%2Bb&checkout_id=c1`, RETURN)).toEqual({
      checkoutId: 'c1',
      sid: 'a+b',
    });
    expect(isCardReturn('HTTPS://WP-Membership-System.com/pay/return?sid=x', RETURN)).toBe(true);
  });

  it('comes back with no sid when Sifalo sent none, so the server is asked instead', () => {
    expect(readCardReturn(`${RETURN}?checkout_id=c1`, RETURN)).toEqual({
      checkoutId: 'c1',
      sid: undefined,
    });
  });

  it.each([
    'https://pay.sifalo.com/checkout/?key=abc&token=def',
    'https://wp-membership-system.com/pay/return-now?sid=x',
    'https://wp-membership-system.com/pay?sid=x',
    'https://evil.example/pay/return?sid=x',
    'https://wp-membership-system.com.evil.example/pay/return?sid=x',
    'about:blank',
    '',
  ])('lets %j load as an ordinary page', (url) => {
    expect(isCardReturn(url, RETURN)).toBe(false);
    expect(readCardReturn(url, RETURN)).toBeNull();
  });
});
