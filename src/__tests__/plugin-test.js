import 'jest.automockoff';
import { join } from 'path';
import {
  resolvePlugin,
  applyPlugins,
} from '../plugin';

describe('plugin', () => {

  it('resolvePlugin file', () => {
    const cwd = join(__dirname, './fixtures/plugin-file/');
    let plugin = resolvePlugin('./1.js?f1&f2=abc&f3[]=a&f3[]=b', null, cwd);
    expect(plugin.query).toEqual({
      f1: true,
      f2: 'abc',
      f3: ['a', 'b'],
    });
    expect(plugin.a).toEqual(1);
  });

  it('resolvePlugin module', () => {
    const cwd = join(__dirname, './fixtures/plugin-module/a/');
    const resolveDir = [
      cwd,
      join(__dirname, './fixtures/plugin-module/b/'),
    ];
    let plugin;
    plugin = resolvePlugin('plugin-a', resolveDir, null);
    expect(plugin.name).toEqual('plugin-a');
    plugin = resolvePlugin('plugin-b', resolveDir, null);
    expect(plugin.name).toEqual('plugin-b');
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
