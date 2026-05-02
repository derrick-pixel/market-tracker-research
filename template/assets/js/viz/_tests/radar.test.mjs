import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRadarData } from '../radar.js';

test('buildRadarData puts "us" first with thick border and fill', () => {
  const data = buildRadarData({
    dimensions: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }],
    scores: { us: { a: 5, b: 4 }, comp1: { a: 3, b: 2 } }
  });
  assert.deepEqual(data.labels, ['A', 'B']);
  assert.equal(data.datasets[0].label, 'us');
  assert.equal(data.datasets[0].borderWidth, 3);
  assert.equal(data.datasets[0].fill, true);
  assert.deepEqual(data.datasets[0].data, [5, 4]);
  assert.equal(data.datasets[1].label, 'comp1');
  assert.equal(data.datasets[1].borderWidth, 1.5);
  assert.equal(data.datasets[1].fill, false);
});

test('buildRadarData preserves dimension order', () => {
  const data = buildRadarData({
    dimensions: [{ key: 'z', label: 'Z' }, { key: 'y', label: 'Y' }, { key: 'x', label: 'X' }],
    scores: { us: { x: 1, y: 2, z: 3 } }
  });
  assert.deepEqual(data.datasets[0].data, [3, 2, 1]);
});

test('buildRadarData fills missing as 0', () => {
  const data = buildRadarData({
    dimensions: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }],
    scores: { us: { a: 5 } }
  });
  assert.deepEqual(data.datasets[0].data, [5, 0]);
});
