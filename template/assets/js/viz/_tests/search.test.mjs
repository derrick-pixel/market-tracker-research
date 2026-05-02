import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesCompetitor } from '../search.js';

const sample = {
  id: 'notaflux', name: 'NotaFlux', primary_value_prop: 'SG-native note workspace',
  hq: 'Singapore', features: ['PSG', 'Data residency'], category: 'sg_local',
  hq_region: 'SEA', threat_level: 4
};

test('empty query matches all', () => {
  assert.equal(matchesCompetitor(sample, '', {}), true);
});

test('matches name case-insensitive', () => {
  assert.equal(matchesCompetitor(sample, 'nota', {}), true);
  assert.equal(matchesCompetitor(sample, 'NOTA', {}), true);
});

test('matches feature text', () => {
  assert.equal(matchesCompetitor(sample, 'residency', {}), true);
});

test('category filter', () => {
  assert.equal(matchesCompetitor(sample, '', { category: 'sg_local' }), true);
  assert.equal(matchesCompetitor(sample, '', { category: 'global_incumbent' }), false);
});

test('threatLevelMin filter', () => {
  assert.equal(matchesCompetitor(sample, '', { threatLevelMin: 4 }), true);
  assert.equal(matchesCompetitor(sample, '', { threatLevelMin: 5 }), false);
});

test('query AND filter both required', () => {
  assert.equal(matchesCompetitor(sample, 'notexist', { category: 'sg_local' }), false);
});
