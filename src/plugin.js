import { parseQuery } from 'loader-utils';
import { join } from 'path';
import assign from 'object-assign';
import isPlainObject from 'is-plain-object';

export function resolvePlugins(pluginNames, base) {
  return pluginNames.map(pluginName => resolvePlugin(pluginName, base));
}

export function resolvePlugin(_pluginName, base) {
  let plugin;
  let query, originQuery, name;

  if (typeof _pluginName === 'string') {
    const [pluginName, _query] = _pluginName.split('?');
    originQuery = `?${_query}`;
    query = parseQuery(originQuery);
    name = pluginName;

    if (isRelative(pluginName)) {
      plugin = require(join(base, pluginName));
    } else {
      plugin = require(pluginName);
    }
  } else if (isPlainObject(_pluginName)) {
    plugin = _pluginName;
  }

  return assign({
    name,
    originQuery,
    query,
    localIP: require('internal-ip')(),
  }, plugin);
}

export function isRelative(filepath) {
  return filepath.charAt(0) === '.';
}

export function applyPlugins(plugins, name, args, applyArgs, app) {
  return plugins.reduce((memo, plugin) => {
    const func = plugin[name];
    if (!func) return memo;
    const ret = func.call(this, assign({}, args, {
      query: plugin.query,
      log: (msg) => console.warn(msg),
    }), memo);
    if (name === 'middleware') {
      app.use(ret);
    }
    return ret;
  }, applyArgs);
}

export function applyMiddlewares(plugins, args, app) {
  applyPlugins(plugins, 'middleware', args, null, app);
}
