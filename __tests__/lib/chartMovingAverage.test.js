import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { addMovingAverage } from '../../lib/chartMovingAverage.js';

describe('chartMovingAverage', () => {
  it('computes a rolling average for numeric series', () => {
    const data = [
      { value: 10 },
      { value: 20 },
      { value: 30 },
      { value: 40 },
    ];

    const result = addMovingAverage(data, 'value', 3, 'valueMa');

    assert.equal(result[0].valueMa, 10);
    assert.equal(result[1].valueMa, 15);
    assert.equal(result[2].valueMa, 20);
    assert.equal(result[3].valueMa, 30);
  });
});
