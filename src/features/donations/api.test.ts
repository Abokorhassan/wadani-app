import { request } from '@/api/client';

import { donationsApi } from './api';

jest.mock('@/api/client', () => ({ request: jest.fn() }));

const requestMock = request as jest.Mock;

const donationDto = {
  id: 'd1',
  method: 'WAAFI',
  amount: '10.00',
  currency: 'USD',
  donatedAt: '2026-09-27T10:00:00.000Z',
};

describe('guest donation', () => {
  it('sends the donor and the wallet to the public endpoint, without a token', async () => {
    requestMock.mockResolvedValue({ donation: donationDto });
    const result = await donationsApi.createGuestDonation({
      fullName: 'Amina Yusuf',
      phone: '63 234 5678',
      amountUsd: 10,
      method: 'WAAFI',
      payerPhone: '63 111 2222',
    });

    expect(requestMock).toHaveBeenLastCalledWith('/mobile/donations', {
      method: 'POST',
      authenticated: false,
      body: {
        fullName: 'Amina Yusuf',
        phone: '+252632345678',
        amount: '10.00',
        method: 'WAAFI',
        payerPhone: '+252631112222',
      },
    });
    expect(result.kind).toBe('donated');
  });

  it('hands back the checkout for a card donation', async () => {
    requestMock.mockResolvedValue({
      checkoutId: '88888888-8888-8888-8888-888888888888',
      checkoutUrl: 'https://pay.sifalo.com/checkout/?key=k&token=t',
    });
    const result = await donationsApi.createGuestDonation({
      fullName: 'Amina Yusuf',
      phone: '63 234 5678',
      amountUsd: 25,
      method: 'CARD',
    });

    const body = requestMock.mock.calls.at(-1)?.[1].body;
    expect(body).not.toHaveProperty('payerPhone');
    expect(body.returnUrl).toBeTruthy();
    expect(result.kind).toBe('checkout');
  });
});
