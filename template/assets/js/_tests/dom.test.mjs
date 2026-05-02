import { test } from 'node:test';
import assert from 'node:assert/strict';

// Minimal document stub for testing pure behaviour under node:test.
globalThis.document = {
  createElement: (tag) => {
    const kids = [];
    const attrs = {};
    return {
      tagName: tag.toUpperCase(),
      className: '',
      style: {},
      dataset: {},
      textContent: '',
      _attrs: attrs,
      _children: kids,
      setAttribute(k, v) { attrs[k] = v; },
      append(...args) { for (const a of args) kids.push(a); },
      addEventListener(type, fn) { attrs['on:' + type] = fn; },
    };
  },
  createTextNode: (s) => ({ nodeType: 3, textContent: String(s) }),
};

const { h } = await import('../dom.js');

test('h creates element with tag', () => {
  const n = h('div');
  assert.equal(n.tagName, 'DIV');
});

test('h sets className from class prop', () => {
  const n = h('span', { class: 'foo bar' });
  assert.equal(n.className, 'foo bar');
});

test('h appends string children as text nodes (escapes by construction)', () => {
  const n = h('p', {}, 'hello <script>alert(1)</script>');
  assert.equal(n._children.length, 1);
  assert.equal(n._children[0].textContent, 'hello <script>alert(1)</script>');
});

test('h flattens nested children arrays', () => {
  const n = h('ul', {}, [h('li', {}, 'a'), h('li', {}, 'b')]);
  assert.equal(n._children.length, 2);
});

test('h skips null/undefined/false children', () => {
  const n = h('div', {}, null, undefined, false, 'ok');
  assert.equal(n._children.length, 1);
  assert.equal(n._children[0].textContent, 'ok');
});

test('h uses setAttribute for unknown attrs', () => {
  const n = h('a', { href: '/x' });
  assert.equal(n._attrs.href, '/x');
});

test('h registers event listeners for on* function props', () => {
  const fn = () => {};
  const n = h('button', { onClick: fn });
  assert.equal(n._attrs['on:click'], fn);
});
