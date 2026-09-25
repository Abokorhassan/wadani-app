import { chargeBody } from './api';

jest.mock('@/api/client', () => ({ request: jest.fn() }));

describe('chargeBody', () => {
  it('sends the wallet number in international form, not as typed', () => {
    // The phone field shows "+252" as a label only, so this arrives bare.
    expect(chargeBody({ method: 'WAAFI', amountUsd: 10, payerPhone: '63 234 5678' })).toEqual({
      amount: '10.00',
      method: 'WAAFI',
      payerPhone: '+252632345678',
    });
  });

  it('writes the amount as a decimal string with two places', () => {
    expect(
      chargeBody({ method: 'EDAHAB', amountUsd: 10.5, payerPhone: '0632345678' })
    ).toMatchObject({
      amount: '10.50',
      payerPhone: '+252632345678',
    });
  });

  it('sends a return address, and no wallet, for a card payment', () => {
    const body = chargeBody({ method: 'CARD', amountUsd: 25, payerPhone: '63 234 5678' });
    expect(body.payerPhone).toBeUndefined();
    expect(body.returnUrl).toBe('https://wp-membership-system.com/pay/return');
  });
});
