import http from 'http';
import koa from 'koa';
import { resolvePlugins, applyPlugins } from './plugin';
import assign from 'object-assign';
import log from 'spm-log';
import async from 'async';
import { join } from 'path';

const defaultCwd = process.cwd();
const defaultArgs = {
  port: '8000',
  cwd: defaultCwd,
  resolveDir: [defaultCwd],
};
const data = {};

export default function createServer(_args, callback) {
  const args = assign({}, defaultArgs, _args);
  log.config(args);

  const { port, cwd, resolveDir } = args;
  let pluginNames = args.plugins;
  const context = { port, cwd, localIP: require('internal-ip')() };
  context.set = (key, val) => data[key] = val;
  context.get = key => data[key];

  pluginNames = pluginNames.concat([
    join(__dirname, './plugins/static'),
    join(__dirname, './plugins/serve-index'),
  ]);

  const plugins = resolvePlugins(pluginNames, resolveDir, cwd);
  function _applyPlugins(name, pluginArgs, _callback) {
    return applyPlugins(plugins, name, context, pluginArgs, _callback);
  }
  context.applyPlugins = _applyPlugins;
  log.debug('dora', `[plugins] ${JSON.stringify(plugins)}`);

  const app = context.app = koa();
  let server;

  process.on('exit', () => {
    _applyPlugins('process.exit');
  });

  async.series([
    next => _applyPlugins('middleware.before', null, next),
    next => _applyPlugins('middleware', null, next),
    next => _applyPlugins('middleware.after', null, next),
    next => { server = context.server = http.createServer(app.callback()); next(); },
    next => _applyPlugins('server.before', null, next),
    next => {
      server.listen(port, () => {
        log.info('dora', `listened on ${port}`);
        next();
      });
    },
    next => _applyPlugins('server.before', null, next),
  ], callback);
}
