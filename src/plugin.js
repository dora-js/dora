import { parseQuery } from 'loader-utils';
import { join } from 'path';
import assign from 'object-assign';
import isPlainObject from 'is-plain-object';
import resolve from './resolve';
import spmLog from 'spm-log';

function isFunction(obj) {
  return typeof obj === 'function';
}

function isGeneratorFunction(obj) {
  return isFunction(obj) && obj.constructor.name === 'GeneratorFunction';
}

function isRelative(filepath) {
  return filepath.charAt(0) === '.';
}

function isAbsolute(filepath) {
  return filepath.charAt(0) === '/';
}

export function resolvePlugin(_pluginName, resolveDir, cwd = process.cwd()) {
  let plugin;
  let query;
  let originQuery;
  let name;

  if (typeof _pluginName === 'string') {
    const [pluginName, _query] = _pluginName.split('?');
    originQuery = `?${_query}`;
    query = parseQuery(originQuery);
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
  }
  // support Function ?

  return assign({
    name,
    originQuery,
    query,
  }, plugin);
}

export function resolvePlugins(pluginNames, resolveDir, cwd) {
  return pluginNames.map(pluginName => resolvePlugin(pluginName, resolveDir, cwd));
}

function getPluginArgs(plugin, args) {
  const log = ['debug', 'info', 'warn', 'error'].reduce((_memo, key) => {
    _memo[key] = (msg) => {
      spmLog[key](plugin.name, msg);
    };
    return _memo;
  }, {});
  const localIP = require('internal-ip')();
  return assign({}, args, {
    query: plugin.query,
    originQuery: plugin.originQuery,
    log,
    localIP,
  });
}

export function* applyPlugins(plugins, name, args, applyArgs, app) {
  let memo = applyArgs;
  for (let i = 0; i < plugins.length; i++) {
    const func = plugins[i][name];
    if (!func || !isFunction(func)) {
      continue;
    }
    const pluginArgs = getPluginArgs(plugins[i], args);
    const ret = isGeneratorFunction(func) ? yield func.call(this, pluginArgs, memo) : func.call(this, pluginArgs, memo);
    if (name === 'middleware') {
      app.use(ret);
    }
    memo = ret;
  }
  return memo;
}

export function applyPluginsSync(plugins, name, args, applyArgs, app) {
  return plugins.reduce((memo, plugin) => {
    const func = plugins[name];
    if (!func || !isFunction(func)) {
      return memo;
    }
    const pluginArgs = getPluginArgs(plugin, args);
    const ret = func.call(this, pluginArgs, memo);
    if (name === 'middleware') {
      app.use(ret);
    }
    return ret;
  }, applyArgs);
}

export function* applyMiddlewares(plugins, args, app) {
  yield applyPlugins(plugins, 'middleware', args, null, app);
}
