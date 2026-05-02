import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cellCount, cellBand, buildCellDetail } from '../heatmap.js';

test('cellCount counts only score >= 3', () => {
  const cell = { competitors: [
    { id: 'a', name: 'A', score: 5 },
    { id: 'b', name: 'B', score: 3 },
    { id: 'c', name: 'C', score: 2 },
    { id: 'd', name: 'D', score: 0 },
  ]};
  assert.equal(cellCount(cell), 2);
});

test('cellCount empty/missing returns 0', () => {
  assert.equal(cellCount({ competitors: [] }), 0);
  assert.equal(cellCount({}), 0);
  assert.equal(cellCount(null), 0);
});

test('cellBand banding', () => {
  assert.equal(cellBand(0), 'green');
  assert.equal(cellBand(1), 'green');
  assert.equal(cellBand(2), 'amber');
  assert.equal(cellBand(3), 'amber');
  assert.equal(cellBand(4), 'red');
  assert.equal(cellBand(10), 'red');
});

test('buildCellDetail verdict matches band', () => {
  const d = buildCellDetail({
    segmentId: 's', needId: 'n', segmentName: 'Solo', needName: 'Fast',
    cell: { our_score: 4, competitors: [
      { id:'a', name:'A', score: 4, specialisation_for_cell: 'x' },
      { id:'b', name:'B', score: 4, specialisation_for_cell: 'x' },
      { id:'c', name:'C', score: 4, specialisation_for_cell: 'x' },
      { id:'d', name:'D', score: 4, specialisation_for_cell: 'x' },
    ]}
  });
  assert.equal(d.verdict, 'CROWDED · AVOID');
  assert.equal(d.band, 'red');
  assert.equal(d.headline, 'Solo × Fast');
  assert.equal(d.competitors.length, 4);
});

test('buildCellDetail sorts by score desc then alphabetical', () => {
  const d = buildCellDetail({
    segmentId: 's', needId: 'n', segmentName: 'Solo', needName: 'Fast',
    cell: { our_score: 5, competitors: [
      { id: 'c', name: 'Charlie', score: 3, specialisation_for_cell: 'x' },
      { id: 'a', name: 'Alpha', score: 5, specialisation_for_cell: 'x' },
      { id: 'b', name: 'Bravo', score: 5, specialisation_for_cell: 'x' },
    ]}
  });
  assert.deepEqual(d.competitors.map(c => c.name), ['Alpha','Bravo','Charlie']);
});

test('buildCellDetail green band verdict', () => {
  const d = buildCellDetail({
    segmentId: 's', needId: 'n', segmentName: 'X', needName: 'Y',
    cell: { our_score: 5, competitors: [] }
  });
  assert.equal(d.band, 'green');
  assert.equal(d.verdict, 'WHITESPACE · ATTACK');
});

test('buildCellDetail amber band verdict', () => {
  const d = buildCellDetail({
    segmentId: 's', needId: 'n', segmentName: 'X', needName: 'Y',
    cell: { our_score: 3, competitors: [
      { id: 'a', name: 'A', score: 4, specialisation_for_cell: 'x' },
      { id: 'b', name: 'B', score: 3, specialisation_for_cell: 'x' },
    ]}
  });
  assert.equal(d.band, 'amber');
  assert.equal(d.verdict, 'CONTESTED · CHOOSE WISELY');
});
