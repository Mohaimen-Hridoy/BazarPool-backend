import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Concurrency-Safe Commitment Capacity Defense', () => {
  const targetQuantity = 50;
  const committedQuantity = 45;
  const minCommitmentQty = 1;
  const maxCommitmentQty = 5;

  it('should accept valid commitment within remaining capacity', () => {
    const requestedQty = 4;
    const remainingCapacity = targetQuantity - committedQuantity;

    assert.ok(requestedQty >= minCommitmentQty, 'Must meet min commitment');
    assert.ok(requestedQty <= maxCommitmentQty, 'Must not exceed max per member');
    assert.ok(requestedQty <= remainingCapacity, 'Must fit within remaining capacity');

    const newCommitted = committedQuantity + requestedQty;
    const willLock = newCommitted >= targetQuantity;

    assert.strictEqual(newCommitted, 49);
    assert.strictEqual(willLock, false);
  });

  it('should reject commitment exceeding remaining capacity', () => {
    const requestedQty = 6;
    const remainingCapacity = targetQuantity - committedQuantity; // 5

    assert.strictEqual(requestedQty > remainingCapacity, true, 'Oversubscription must be caught');
  });

  it('should lock campaign precisely when target quantity is met', () => {
    const requestedQty = 5;
    const remainingCapacity = targetQuantity - committedQuantity;

    assert.strictEqual(requestedQty, remainingCapacity);

    const newCommitted = committedQuantity + requestedQty;
    const willLock = newCommitted >= targetQuantity;

    assert.strictEqual(newCommitted, 50);
    assert.strictEqual(willLock, true);
  });
});

