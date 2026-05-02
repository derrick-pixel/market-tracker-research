// market-funnel.test.mjs — pure-helper tests for buildFunnelData.
// Run via: node --test template/assets/js/viz/_tests/market-funnel.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFunnelData } from '../market-funnel.js';

test('buildFunnelData — null input', () => {
  const out = buildFunnelData(null);
  assert.deepEqual(out.stages, []);
  assert.deepEqual(out.implications, []);
  assert.equal(out.legacy_mode, false);
});

test('buildFunnelData — modern shape', () => {
  const ms = {
    tam_sgd: 1000, sam_sgd: 500, som_sgd: 50,
    derivation_flow: {
      tam: { stage_label: 'STAGE 1 · TAM', subtitle: 's', result_label: 'X', total_equation: 'a+b', stacks: [{ name: 'n', source: 's', inputs: [], equation: '', result_label: 'r' }] },
      sam: { stage_label: 'STAGE 2 · SAM', subtitle: 's', result_label: 'Y', total_equation: 'c', filters: ['f1'], stacks: [] },
      som: { stage_label: 'STAGE 3 · SOM', subtitle: 's', result_label: 'Z', total_equation: 'd', stacks: [] },
    },
    implications: [{ headline: 'H', body: 'B' }],
    methodology_appendix: 'long prose',
    sources: [{ title: 'T', url: 'https://x' }],
  };
  const out = buildFunnelData(ms);
  assert.equal(out.stages.length, 3);
  assert.equal(out.stages[0].key, 'tam');
  assert.equal(out.stages[1].filters[0], 'f1');
  assert.equal(out.implications.length, 1);
  assert.equal(out.appendix, 'long prose');
  assert.equal(out.legacy_mode, false);
});

test('buildFunnelData — legacy fallback', () => {
  const ms = {
    tam_sgd: 1, sam_sgd: 1, som_sgd: 1,
    reasoning: 'wall of text',
    implication_for_us: 'old single string',
    sources: [],
  };
  const out = buildFunnelData(ms);
  assert.equal(out.legacy_mode, true);
  assert.equal(out.legacy_paragraph, 'wall of text');
  assert.equal(out.legacy_implication, 'old single string');
});

test('buildFunnelData — modern with no implications still treated as modern', () => {
  // If derivation_flow is present, legacy mode must NOT trigger even without implications[].
  const ms = {
    derivation_flow: { tam: { stage_label: 'X', subtitle: '', result_label: '', total_equation: '', stacks: [] } },
    reasoning: 'should not show as legacy',
  };
  const out = buildFunnelData(ms);
  assert.equal(out.legacy_mode, false);
  assert.equal(out.stages.length, 3);
  assert.ok(out.stages[1].missing); // sam missing
});

test('buildFunnelData — missing stage is flagged not silently skipped', () => {
  const ms = {
    derivation_flow: {
      tam: { stage_label: 'X', subtitle: '', result_label: '', total_equation: '', stacks: [] },
      // sam missing
      som: { stage_label: 'Z', subtitle: '', result_label: '', total_equation: '', stacks: [] },
    },
    implications: [],
  };
  const out = buildFunnelData(ms);
  assert.equal(out.stages[1].missing, true);
});
