import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateSwimExportString,
  parseSwimImportString,
  __testing,
} from '../../lib/swimImportExport.js';

const sampleData = {
  profile: { sex: 'male', age: 35 },
  sessions: [
    {
      id: 'test-1',
      date: '2025-06-03',
      createdAt: '2025-06-03T12:00:00.000Z',
      metrics: {
        durationSec: 3267,
        distanceM: 2550,
        activeKcal: 573,
        totalKcal: 680,
        paceSecPer100m: 130,
        avgHeartRate: 140,
        laps: 102,
        poolLengthM: 25,
        goalM: 2500,
        location: 'Tilburg',
        timeRange: '11:07–12:01',
        strokes: { mixedM: 50, breaststrokeM: 475, freestyleM: 2025 },
      },
    },
  ],
};

describe('swimImportExport', () => {
  it('round-trips export and import', async () => {
    const exported = await generateSwimExportString(sampleData);
    assert.ok(exported.includes(':'));
    const imported = await parseSwimImportString(exported);
    assert.deepEqual(imported.profile, sampleData.profile);
    assert.equal(imported.sessions.length, 1);
    assert.equal(imported.sessions[0].metrics.distanceM, 2550);
    assert.equal(imported.sessions[0].metrics.paceSecPer100m, 130);
  });

  it('rejects invalid checksum', async () => {
    const exported = await generateSwimExportString(sampleData);
    const [payload] = exported.split(':');
    await assert.rejects(
      () => parseSwimImportString(`${payload}:00000000`),
      /Checksum validation failed/
    );
  });

  it('compresses session fields', () => {
    const compressed = __testing.compressSession(sampleData.sessions[0]);
    assert.equal(compressed.m.dm, 2550);
    const restored = __testing.decompressSession(compressed);
    assert.equal(restored.metrics.distanceM, 2550);
  });
});
