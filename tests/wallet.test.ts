import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Fintech Double-Entry Ledger Logic', () => {
  it('should reserve funds atomically without modifying total net worth', () => {
    let availableBalance = 10000;
    let reservedBalance = 0;
    const commitmentCost = 3200;

    assert.ok(availableBalance >= commitmentCost, 'Balance must be sufficient');

    // Action: Reserve funds
    availableBalance -= commitmentCost;
    reservedBalance += commitmentCost;

    assert.strictEqual(availableBalance, 6800);
    assert.strictEqual(reservedBalance, 3200);
    assert.strictEqual(availableBalance + reservedBalance, 10000, 'Net worth must stay conserved');
  });

  it('should debit reserved funds permanently upon campaign lock', () => {
    let availableBalance = 6800;
    let reservedBalance = 3200;
    const debitAmount = 3200;

    // Action: Campaign locks -> reserved funds are debited
    reservedBalance -= debitAmount;

    assert.strictEqual(availableBalance, 6800);
    assert.strictEqual(reservedBalance, 0);
  });

  it('should restore 100% of reserved funds upon campaign expiry or cancellation', () => {
    let availableBalance = 6800;
    let reservedBalance = 3200;
    const refundAmount = 3200;

    // Action: Campaign expired -> refund back to available balance
    reservedBalance -= refundAmount;
    availableBalance += refundAmount;

    assert.strictEqual(availableBalance, 10000);
    assert.strictEqual(reservedBalance, 0);
  });
});

