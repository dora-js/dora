import 'jest.automockoff';
import { join } from 'path';
import {
  resolvePlugin,
  applyPlugins,
} from '../plugin';

describe('plugin', () => {

  it('resolvePlugin', () => {
    const base = join(__dirname, './fixtures/plugin/');
    let plugin = resolvePlugin('./1.js?f1&f2=abc&f3[]=a&f3[]=b', base);
    expect(plugin.query).toEqual({
      f1: true,
      f2: 'abc',
      f3: ['a', 'b'],
    });
    expect(plugin.a).toEqual(1);
  });

  it('applyPlugins', () => {
    const result = applyPlugins([
      { test: (args, memo) => memo + '1' },
      { test: (args, memo) => memo + '2' },
      { a: 1 },
    ], 'test', {}, '0');
    expect(result).toEqual('012');
  });

  it('applyPlugins', () => {
    const result = applyPlugins([
      { test: (args, memo) => memo + '1' },
      { test: (args, memo) => memo + '2' },
      { a: 1 },
    ], 'test', {}, '0');
    expect(result).toEqual('012');
  });

});
