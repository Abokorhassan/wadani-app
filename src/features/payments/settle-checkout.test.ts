import { ApiRequestError } from '@/api/errors';

import { settleCheckout } from './settle-checkout';
import type { CheckoutStatus } from './types';

function fakeApi(options: {
  confirm?: () => Promise<Record<string, unknown>>;
  status?: CheckoutStatus;
}) {
  return {
    confirmCard: jest.fn(options.confirm ?? (async () => ({ purpose: 'REGISTER' }))),
    getCheckoutStatus: jest.fn(async () => options.status ?? 'PENDING'),
  };
}

const conflict = () => Promise.reject(new ApiRequestError({ kind: 'server', status: 409 }));
const declined = () => Promise.reject(new ApiRequestError({ kind: 'declined' }));
const badPayload = () =>
  Promise.reject(new ApiRequestError({ kind: 'validation', fieldErrors: {} }));
const offline = () => Promise.reject(new ApiRequestError({ kind: 'network' }));

describe('settleCheckout', () => {
  it('confirms with the sid and hands back what the server created', async () => {
    const api = fakeApi({ confirm: async () => ({ purpose: 'REGISTER', member: { id: 'm' } }) });
    expect(await settleCheckout(api, 'c1', 'sid-1')).toEqual({
      status: 'completed',
      result: { purpose: 'REGISTER', member: { id: 'm' } },
    });
    expect(api.confirmCard).toHaveBeenCalledWith('c1', 'sid-1');
  });

  it('reports a card Sifalo refused as declined', async () => {
    expect(await settleCheckout(fakeApi({ confirm: declined }), 'c1', 'sid')).toEqual({
      status: 'failed',
      reason: 'declined',
    });
    // A rejected payload cannot be retried into success either.
    expect(await settleCheckout(fakeApi({ confirm: badPayload }), 'c1', 'sid')).toEqual({
      status: 'failed',
      reason: 'declined',
    });
  });

  it('treats a 409 as done when the server says the checkout completed', async () => {
    // e.g. the confirm raced another one that already finished
    const api = fakeApi({ confirm: conflict, status: 'COMPLETED' });
    expect(await settleCheckout(api, 'c1', 'sid')).toEqual({ status: 'completed' });
  });

  it('flags a 409 that did not complete as needing the office', async () => {
    const api = fakeApi({ confirm: conflict, status: 'FAILED_AFTER_PAYMENT' });
    expect(await settleCheckout(api, 'c1', 'sid')).toEqual({
      status: 'failed',
      reason: 'conflict',
    });
  });

  it('does not call a dropped connection a failure if the server finished anyway', async () => {
    expect(
      await settleCheckout(fakeApi({ confirm: offline, status: 'COMPLETED' }), 'c1', 'sid')
    ).toEqual({ status: 'completed' });
    expect(
      await settleCheckout(fakeApi({ confirm: offline, status: 'PENDING' }), 'c1', 'sid')
    ).toEqual({ status: 'failed', reason: 'error' });
  });

  it('asks the server when the member closed the page, since they may have paid', async () => {
    const api = fakeApi({ status: 'COMPLETED' });
    expect(await settleCheckout(api, 'c1')).toEqual({ status: 'completed' });
    expect(api.confirmCard).not.toHaveBeenCalled();
  });

  it('calls it cancelled only when the server has no payment', async () => {
    expect(await settleCheckout(fakeApi({ status: 'PENDING' }), 'c1')).toEqual({
      status: 'cancelled',
    });
    expect(await settleCheckout(fakeApi({ status: 'FAILED_AFTER_PAYMENT' }), 'c1')).toEqual({
      status: 'failed',
      reason: 'conflict',
    });
  });
});
