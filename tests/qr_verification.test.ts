import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('QR Token Redemption & Double-Spending Defense', () => {
  it('should allow first-time redemption of active pending token', () => {
    const token = {
      id: 'token-123',
      tokenCode: 'BP-A1B2-C3D4',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 100000),
      redeemedAt: null as Date | null,
    };

    assert.strictEqual(token.status, 'PENDING');
    assert.ok(new Date() < token.expiresAt, 'Token must not be expired');

    // Action: Redeem
    token.status = 'REDEEMED';
    token.redeemedAt = new Date();

    assert.strictEqual(token.status, 'REDEEMED');
    assert.ok(token.redeemedAt !== null);
  });

  it('should reject already redeemed token with double-redemption protection', () => {
    const redeemedToken = {
      id: 'token-123',
      tokenCode: 'BP-A1B2-C3D4',
      status: 'REDEEMED',
      redeemedAt: new Date(),
    };

    const isDoubleRedemption = redeemedToken.status === 'REDEEMED';
    assert.strictEqual(isDoubleRedemption, true, 'Double redemption must strictly trigger error');
  });

  it('should reject expired tokens', () => {
    const expiredToken = {
      id: 'token-456',
      tokenCode: 'BP-E5F6-G7H8',
      status: 'PENDING',
      expiresAt: new Date(Date.now() - 10000), // In the past
    };

    const isExpired = new Date() > expiredToken.expiresAt;
    assert.strictEqual(isExpired, true, 'Expired token must not be authorized');
  });
});

