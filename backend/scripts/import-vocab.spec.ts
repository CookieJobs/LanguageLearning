import { inferPos, inferCefr, getDefinitionEn } from './import-elementary-vocab';
import * as assert from 'assert';

console.log('Running Import Vocab Helpers Tests...');

try {
  // inferPos
  assert.strictEqual(inferPos('n. apple', '苹果'), 'noun', 'inferPos noun');
  assert.strictEqual(inferPos('run', 'v. 跑'), 'verb', 'inferPos verb');
  assert.strictEqual(inferPos('hello', '你好'), 'noun', 'inferPos default');
  console.log('✓ inferPos tests passed');

  // inferCefr
  assert.strictEqual(inferCefr('zk gk', '0'), 'A2', 'inferCefr zk');
  assert.strictEqual(inferCefr('', '5'), 'A1', 'inferCefr collins 5');
  assert.strictEqual(inferCefr('', '0'), 'A1', 'inferCefr default');
  console.log('✓ inferCefr tests passed');

  // getDefinitionEn
  assert.strictEqual(getDefinitionEn('n. a fruit\nsomething else'), 'a fruit', 'getDefinitionEn clean');
  assert.strictEqual(getDefinitionEn(''), '', 'getDefinitionEn empty');
  console.log('✓ getDefinitionEn tests passed');

  console.log('All tests passed!');
} catch (e) {
  console.error('Test failed:', e);
  process.exit(1);
}
