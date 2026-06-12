import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseScreenshotText, __testing } from '../../lib/screenshotParser.js';

const { parseDutchDate } = __testing;

const OCR_JUN3 = `
wo 3 jun
Zwembad
Doel: 2.500 M
Gemengd (50 m)
Schoolslag (475 m)
Vrije slag (2.025 m)
11:07-12:01
Tilburg
Work-outtijd
0:54:27
Afstand
2.550 M
Actieve kilocalorieën
573 KCAL
Totale kilocalorieën
680 KCAL
Gem. tempo
2'10" /100m
Gem. hartslag
140 SPM
Banen
102
Baanlengte
25 M
`;

const OCR_JUN8 = `
ma 8 jun
Zwembad
Doel: 2.500 M
Gemengd (25 m)
Schoolslag (250 m)
Vrije slag (2.225 m)
10:50-11:41
Tilburg
Work-outtijd 0:51:15
Afstand 2.500 M
Actieve kilocalorieën 547 KCAL
Totale kilocalorieën 648 KCAL
Gem. tempo 2'03" /100m
Gem. hartslag 143 SPM
Banen 100
Baanlengte 25 M
`;

const OCR_NO_DATE = `
Zwembad
Doel: 2.500 M
Gemengd (50 m)
Schoolslag (1.200 m)
Vrije slag (1.425 m)
11:33-12:27
Tilburg
Work-outtijd 0:53:29
Afstand 2.675 M
Actieve kilocalorieën 575 KCAL
Totale kilocalorieën 679 KCAL
Gem. tempo 2'00" /100m
Gem. hartslag 144 SPM
Banen 107
Baanlengte 25 M
`;

describe('screenshotParser', () => {
  const refDate = new Date('2025-06-10');

  it('parses Dutch date wo 3 jun', () => {
    assert.equal(parseDutchDate('wo 3 jun', refDate), '2025-06-03');
  });

  it('parses full screenshot Jun 3', () => {
    const result = parseScreenshotText(OCR_JUN3, refDate);
    assert.equal(result.missingDate, false);
    assert.equal(result.fields.date, '2025-06-03');
    assert.equal(result.fields.distanceM, 2550);
    assert.equal(result.fields.durationSec, 54 * 60 + 27);
    assert.equal(result.fields.paceSecPer100m, 130);
    assert.equal(result.fields.avgHeartRate, 140);
    assert.equal(result.fields.activeKcal, 573);
    assert.equal(result.fields.totalKcal, 680);
    assert.equal(result.fields.laps, 102);
    assert.equal(result.fields.poolLengthM, 25);
    assert.equal(result.fields.goalM, 2500);
    assert.equal(result.fields.strokes.freestyleM, 2025);
    assert.equal(result.fields.strokes.breaststrokeM, 475);
    assert.equal(result.fields.strokes.mixedM, 50);
    assert.equal(result.fields.location, 'Tilburg');
  });

  it('parses full screenshot Jun 8', () => {
    const result = parseScreenshotText(OCR_JUN8, refDate);
    assert.equal(result.fields.date, '2025-06-08');
    assert.equal(result.fields.distanceM, 2500);
    assert.equal(result.fields.paceSecPer100m, 123);
    assert.equal(result.fields.laps, 100);
  });

  it('detects missing date', () => {
    const result = parseScreenshotText(OCR_NO_DATE, refDate);
    assert.equal(result.missingDate, true);
    assert.equal(result.fields.date, null);
    assert.equal(result.fields.distanceM, 2675);
    assert.equal(result.fields.paceSecPer100m, 120);
    assert.equal(result.fields.laps, 107);
  });
});
