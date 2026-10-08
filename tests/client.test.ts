import { test } from 'node:test';
import assert from 'node:assert/strict';
import { businessDay, minorUnits, lineTotal } from '../src/lib/client';
test('money parser preserves decimal places including pasted whitespace',()=>{
  assert.equal(minorUnits('1.2 '),120);assert.equal(minorUnits(' 1.23 '),123);assert.equal(minorUnits('001.01'),101);
});
test('signed corrections trim before detecting the sign',()=>{
  assert.equal(minorUnits(' -1 ',3,true),-1000);assert.equal(minorUnits(' -0.125 ',3,true),-125);
});
test('money parser rejects exponential, overprecision, nonnumbers and unsupported limits',()=>{
  for(const amount of ['1e3','1.234','Infinity','','-1','1,000','10000001'])assert.throws(()=>minorUnits(amount));
});
test('500 grams uses exact half-up paise rounding',()=>{
  assert.equal(lineTotal(4000,500),2000);assert.equal(lineTotal(333,500),167);
});
test('India business day includes early-morning UTC entries and crosses midnight correctly',()=>{
  assert.equal(businessDay('2026-10-08T19:00:00.000Z'),'2026-10-09');
  assert.equal(businessDay('2026-10-08T18:00:00.000Z'),'2026-10-08');
});
