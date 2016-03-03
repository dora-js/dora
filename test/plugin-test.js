import { join } from 'path';
import { resolvePlugin, resolvePlugins, applyPlugins } from '../src/plugin';
import expect from 'expect';

describe('plugin', () => {

  it('resolvePlugin', () => {
    const cwd = join(__dirname, './fixtures/plugin-resolve/');
    let plugin;

    // Relative
    plugin = resolvePlugin('./a', null, cwd);
    expect(plugin).toEqual({ name: 'a', originQuery: undefined, query: {}, a: 1 });

    // Absolute
    plugin = resolvePlugin(join(cwd, 'a'), null, cwd);
    expect(plugin).toEqual({ name: 'a', originQuery: undefined, query: {}, a: 1 });

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
      query: {},
      b: 1,
    });

    // Error: plugin not found
    expect(() => resolvePlugin('foo', [cwd], cwd)).toThrow(/foo not found/);

    // Module with dirnames
    plugin = resolvePlugin('foo', [cwd, join(cwd, 'node_modules/c')], cwd);
    expect(plugin).toEqual({ name: 'd', originQuery: undefined, query: {} });

    // Object
    plugin = resolvePlugin({a:1}, null, null);
    expect(plugin).toEqual({a:1,name:undefined,originQuery:undefined,query:{}});

    // Error: unsupported pluginName Type
    expect(() => resolvePlugin(null, null, null)).toThrow(/pluginName must be string or object/);
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

  it('applyPlugins sync', () => {
    const result = applyPlugins([
      { test: (memo) => memo + '1' },
      { test: (memo) => memo + '2' },
      { a: 1 },
    ], 'test', {}, '0');
    expect(result).toEqual('012');
  });

  xit('applyPlugins sync with Promise', () => {
    const result = applyPlugins([
      { test(memo) { return new Promise(function(resolve) { resolve(memo + '1'); }); } },
      { test: (memo) => memo + '2' },
    ], 'test', {}, '0');
    expect(result).toEqual('012');
  });

  it('applyPlugins async', () => {
    const result = applyPlugins([
      { test(memo) { return new Promise(function(resolve) { process.nextTick( () => { resolve(memo + '1'); }); }); } },
      { test(memo) { return new Promise(function(resolve) {process.nextTick( () => { resolve(memo + '2'); }); }); } },
    ], 'test', {}, '0', (err, result) => {
      expect(result).toEqual('012');
      done();
    });
  });

  it('applyPlugins async + sync', () => {
    const result = applyPlugins([
      { test(memo) { return memo + '1'; } },
      { test(memo) { return new Promise(function(resolve) { process.nextTick( () => { resolve(memo + '2'); }); }); } },
    ], 'test', {}, '0', (err, result) => {
      expect(result).toEqual('012');
      done();
    });
  });

  it('applyPlugins generator', () => {
    const result = applyPlugins([
      { test(memo) { return memo + '1'; } },
      { *test(memo) {
          yield new Promise((resolve) => {
            process.nextTick(() => { resolve(memo + '2'); });
          });
        }
      },
    ], 'test', {}, '0', (err, result) => {
      expect(result).toEqual('012');
      done();
    });
  });

});
