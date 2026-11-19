import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';
const source = readFileSync(new URL('../src/utils/csv.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});
const { csvCell } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);
test('CSV preserves Thai text, quotes, commas and multiline data', () => {
  assert.equal(csvCell('ห้อง "101", ชั้นหนึ่ง\nห้องแอร์'), '"ห้อง ""101"", ชั้นหนึ่ง\nห้องแอร์"');
});
test('CSV neutralizes spreadsheet formulas including leading whitespace', () => {
  for (const value of ['=1+1', '+cmd', '-1+1', '@SUM(A1)', '\t=1+1', '  =1+1']) {
    assert.equal(csvCell(value), '"\'' + value + '"');
  }
});
