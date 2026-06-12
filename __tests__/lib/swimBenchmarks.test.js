import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getBenchmarkForProfile,
  getSwimLevel,
  getAgeGroup,
  __testing,
} from '../../lib/swimBenchmarks.js';

const { BENCHMARKS } = __testing;

const assertOrdered = (b) => {
  assert.ok(b.advanced < b.intermediate, 'advanced faster than intermediate');
  assert.ok(b.intermediate <= b.median, 'intermediate at most median');
  assert.ok(b.median <= b.beginner, 'median at most beginner');
};

describe('swimBenchmarks', () => {
  it('orders tiers correctly for every age group and sex', () => {
    Object.values(BENCHMARKS).forEach((byAge) => {
      Object.values(byAge).forEach(assertOrdered);
    });
  });

  it('slows benchmarks with age for males', () => {
    const young = getBenchmarkForProfile('male', 28);
    const older = getBenchmarkForProfile('male', 62);
    assert.ok(older.intermediate > young.intermediate);
    assert.ok(older.beginner > young.beginner);
  });

  it('has females slower than males in same age band', () => {
    const male = getBenchmarkForProfile('male', 40);
    const female = getBenchmarkForProfile('female', 40);
    assert.ok(female.intermediate > male.intermediate);
  });

  it('classifies recreational paces into expected levels', () => {
    const b = getBenchmarkForProfile('male', 35);
    assert.equal(getSwimLevel(106, b), 'advanced');
    assert.equal(getSwimLevel(134, b), 'intermediate');
    assert.equal(getSwimLevel(158, b), 'beginner');
    assert.equal(getSwimLevel(200, b), 'developing');
  });

  it('maps ages to standard masters brackets', () => {
    assert.equal(getAgeGroup(24), '18-24');
    assert.equal(getAgeGroup(34), '30-34');
    assert.equal(getAgeGroup(72), '70+');
  });
});
