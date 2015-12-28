import { parseQuery } from 'loader-utils';
import { join } from 'path';
import assign from 'object-assign';
import isPlainObject from 'is-plain-object';
import resolve from './resolve';
import spmLog from 'spm-log';
import _isAsync from 'dora-util-is-async';
import reduceAsync from './reduceAsync';

function isRelative(filepath) {
  return filepath.charAt(0) === '.';
}

function isAbsolute(filepath) {
  return filepath.charAt(0) === '/';
}

function isAsync(func) {
  return _isAsync(func.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1]);
}

export function resolvePlugin(_pluginName, resolveDir, cwd = process.cwd()) {
  let plugin;
  let query;
  let originQuery;
  let name;

  if (typeof _pluginName === 'string') {
    const [pluginName, _query] = _pluginName.split('?');
    if (_query) {
      originQuery = `?${_query}`;
      query = parseQuery(originQuery);
    }
    name = pluginName;

    if (isRelative(pluginName)) {
      plugin = require(join(cwd, pluginName));
    } else if (isAbsolute(pluginName)) {
      plugin = require(pluginName);
    } else {
      // is Module
      const pluginPath = resolve(pluginName, resolveDir);
      if (!pluginPath) {
        throw new Error(`[Error] ${pluginName} not found in ${resolveDir}`);
      }
      plugin = require(pluginPath);
    }
  } else if (isPlainObject(_pluginName)) {
    plugin = _pluginName;
  } else {
    throw Error('[Error] pluginName must be string or object');
  }

  return assign({
    name,
    originQuery,
    query,
  }, plugin);
}

export function resolvePlugins(pluginNames, resolveDir, cwd) {
  return pluginNames.map(pluginName => resolvePlugin(pluginName, resolveDir, cwd));
}

export function applyPlugins(plugins, name, context = {}, pluginArgs, _callback = function noop() {}) {
  if (!plugins || !plugins.length) return _callback();
  let ret;

  reduceAsync(plugins, pluginArgs, (memo, plugin, callback) => {
    const func = plugin[name];
    if (!func) return callback(null, memo);

    const log = ['debug', 'info', 'warn', 'error'].reduce((_memo, key) => {
      _memo[key] = (msg) => {
        spmLog[key](plugin.name, msg);
      };
      return _memo;
    }, {});

    // Add more context api
    context.query = plugin.query;
    context.originQuery = plugin.originQuery;
    context.log = log;
    context.callback = callback;

    if (name === 'middleware') {
      context.app.use(func.call(context));
      callback();
    } else if (isAsync(func)) {
      func.call(context, memo);
    } else {
      callback(null, func.call(context, memo));
    }
  }, (err, result) => {
    ret = result;
    if (_callback) _callback(err, result);
  });

  // For all sync plugins.
  return ret;
}
