import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { findDuplicateSession } from '../../lib/swimDuplicates.js';

const session = (id, date, metrics) => ({ id, date, metrics });

describe('findDuplicateSession', () => {
  const existing = [
    session('1', '2025-06-03', {
      durationSec: 3267,
      distanceM: 2550,
      paceSecPer100m: 130,
      timeRange: '11:07-12:01',
    }),
  ];

  it('returns null when no sessions match', () => {
    assert.equal(
      findDuplicateSession(existing, {
        date: '2025-06-03',
        metrics: { durationSec: 3267, distanceM: 2000 },
      }),
      null
    );
  });

  it('detects duplicate on same date with matching distance and duration', () => {
    const dup = findDuplicateSession(existing, {
      date: '2025-06-03',
      metrics: {
        durationSec: 3267,
        distanceM: 2550,
        paceSecPer100m: 130,
      },
    });
    assert.equal(dup?.id, '1');
  });

  it('ignores different dates', () => {
    assert.equal(
      findDuplicateSession(existing, {
        date: '2025-06-04',
        metrics: { durationSec: 3267, distanceM: 2550 },
      }),
      null
    );
  });

  it('allows small pace variance from OCR', () => {
    const dup = findDuplicateSession(existing, {
      date: '2025-06-03',
      metrics: { durationSec: 3267, distanceM: 2550, paceSecPer100m: 133 },
    });
    assert.equal(dup?.id, '1');
  });

  it('rejects when time ranges differ', () => {
    assert.equal(
      findDuplicateSession(existing, {
        date: '2025-06-03',
        metrics: {
          durationSec: 3267,
          distanceM: 2550,
          timeRange: '14:00-15:00',
        },
      }),
      null
    );
  });
});
