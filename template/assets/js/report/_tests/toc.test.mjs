import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computePageIndex } from '../toc.js';

test('computePageIndex accumulates page counts from 1', () => {
  const sections = [
    { id: 'a', countPages: () => 1 },
    { id: 'b', countPages: () => 2 },
    { id: 'c', countPages: () => 3 },
  ];
  const idx = computePageIndex(sections, {});
  assert.deepEqual(idx, { a: 1, b: 2, c: 4, _total: 6 });
});

test('computePageIndex passes data to countPages', () => {
  const sections = [
    { id: 'a', countPages: (d) => d.n },
    { id: 'b', countPages: () => 1 },
  ];
  const idx = computePageIndex(sections, { n: 5 });
  assert.deepEqual(idx, { a: 1, b: 6, _total: 6 });
});
