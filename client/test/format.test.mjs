import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

// Execute the actual pure TypeScript module without a browser/test framework.
const source = readFileSync(new URL('../src/utils/format.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});
const { money, thaiDate, roomType, bookingStatus } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);

test('missing rent is distinct from zero rent', () => {
  for (const value of [null, undefined, '', '   ', 'invalid', NaN, Infinity]) {
    assert.equal(money(value), 'ยังไม่ระบุ');
  }
  assert.match(money(0), /0/);
  assert.notEqual(money(0), 'ยังไม่ระบุ');
  assert.equal(money('3500.50'), money(3500.5));
});

test('dates consistently use Bangkok time and accept epoch zero', () => {
  for (const value of [null, undefined, '', 'invalid']) assert.equal(thaiDate(value), 'ยังไม่ระบุ');
  assert.notEqual(thaiDate(0), 'ยังไม่ระบุ');
  assert.equal(thaiDate('2027-01-01T18:00:00Z'), thaiDate('2027-01-02T01:00:00+07:00'));
});

test('unknown API values have safe labels including object property names', () => {
  assert.equal(roomType('AC'), 'ห้องปรับอากาศ');
  for (const value of ['UNKNOWN', 'toString', '__proto__']) {
    assert.equal(roomType(value), 'ห้องพัก');
    assert.equal(bookingStatus(value).label, 'ไม่ทราบสถานะ');
  }
});
