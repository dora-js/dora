import { parseQuery } from 'loader-utils';
import { join } from 'path';
import isPlainObject from 'is-plain-object';
import resolve from './resolve';
import spmLog from 'spm-log';
import reduceAsync from './reduceAsync';
import isGeneratorFn from 'is-generator-fn';
import co from 'co';

function isRelative(filepath) {
  return filepath.charAt(0) === '.';
}

function isAbsolute(filepath) {
  return filepath.charAt(0) === '/';
}

export function resolvePlugin(_pluginName, resolveDir, cwd = process.cwd()) {
  let plugin;
  let query = {};
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

  return {
    name,
    originQuery,
    query,
    ...plugin,
  };
}

export function resolvePlugins(pluginNames, resolveDir, cwd) {
  return pluginNames.map(pluginName => resolvePlugin(pluginName, resolveDir, cwd));
}

export function applyPlugins(plugins, name, context, pluginArgs, _callback = function noop() {}) {
  let ret;
  const contextModify = context;

  reduceAsync(plugins, pluginArgs, (memo, plugin, callback) => {
    const func = plugin[name];
    if (!func) return callback(null, memo);

    const log = ['debug', 'info', 'warn', 'error'].reduce((_memo, key) => {
      const m = _memo;
      m[key] = (msg) => {
        spmLog[key](plugin.name, msg);
      };
      return m;
    }, {});
    // Add more context api
    contextModify.plugins = plugins;
    contextModify.query = plugin.query;
    contextModify.log = log;
    contextModify.callback = callback;
    contextModify.restart = () => {
      console.log();
      spmLog.info('dora', 'try to restart...');
      process.send('restart');
    };

    if (name === 'middleware') {
      contextModify.app.use(func.call(contextModify));
      callback();
    } else if (isGeneratorFn(func)) {
      co.wrap(func).call(contextModify).then((val) => {
        callback(null, val);
      }, callback);
    } else {
      const funcResult = func.call(contextModify, memo);
      if (funcResult && funcResult.then) {
        funcResult.then(result => {
          callback(null, result);
        }).catch(callback);
      } else {
        callback(null, funcResult);
      }
    }
  }, (err, result) => {
    ret = result;
    if (_callback) _callback(err, result);
  });

  // For all sync plugins.
  return ret;
}
