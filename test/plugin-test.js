import { join } from 'path';
import { resolvePlugin, resolvePlugins, applyPlugins } from '../src/plugin';
import expect from 'expect';

describe('plugin', () => {

  it('resolvePlugin', () => {
    const cwd = join(__dirname, './fixtures/plugin-resolve/');
    let plugin;

    // Relative
    plugin = resolvePlugin('./a', null, cwd);
    expect(plugin).toEqual({ name: 'a', originQuery: undefined, query: undefined, a: 1 });

    // Absolute
    plugin = resolvePlugin(join(cwd, 'a'), null, cwd);
    expect(plugin).toEqual({ name: 'a', originQuery: undefined, query: undefined, a: 1 });

    // With query
    plugin = resolvePlugin('./a?b=1&c', null, cwd);
    expect(plugin).toEqual({
      name: 'a',
      originQuery: '?b=1&c',
      query: { b: '1', c: true },
      a: 1,
    });

    // Module
    plugin = resolvePlugin('b', [cwd], cwd);
    expect(plugin).toEqual({
      name: 'b-renamed',
      originQuery: undefined,
      query: undefined,
      b: 1,
    });

    // Error
    expect(() => resolvePlugin('foo', [cwd], cwd)).toThrow(/foo not found/);

    // Module with dirnames
    plugin = resolvePlugin('foo', [cwd, join(cwd, 'node_modules/c')], cwd);
    expect(plugin).toEqual({ name: 'd', originQuery: undefined, query: undefined });
  });

  it('resolvePlugins', () => {
    const cwd = join(__dirname, './fixtures/plugin-resolve/');
    let plugins;

    plugins = resolvePlugins(['./a?foo', 'b?bar'], [cwd, join(cwd, 'node_modules/c')], cwd);
    expect(plugins).toEqual([
      {
        name: 'a', originQuery: '?foo', query: { foo: true }, a: 1
      },
      {
        name: 'b-renamed',
        originQuery: '?bar',
        query: { bar: true },
        b: 1
      },
    ]);
  });

  xit('applyPlugins', () => {
    const result = applyPlugins([
      { test: (args, memo) => memo + '1' },
      { test: (args, memo) => memo + '2' },
      { a: 1 },
    ], 'test', {}, '0');
    expect(result).toEqual('012');
  });

});
