import http from 'http';
import koa from 'koa';
import { resolvePlugins, applyPlugins, applyMiddlewares } from './plugin';
import assign from 'object-assign';
import log from 'spm-log';

const cwd = process.cwd();
const defaultArgs = {
  port: '8000',
  cwd: cwd,
  resolveDir: [cwd],
};

export default function createServer(_args) {
  const args = assign({}, defaultArgs, _args);
  log.config(args);

  const { plugins: pluginNames, port, cwd } = args;
  function _applyPlugins(name, applyArgs) {
    return applyPlugins(plugins, name, pluginArgs, applyArgs);
  }
  const pluginArgs = {
    port,
    cwd,
    applyPlugins:_applyPlugins,
  };
  const plugins = resolvePlugins(pluginNames, args.resolveDir, args.cwd);
  log.debug('dora', `[plugins] ${JSON.stringify(plugins)}`);
  const app = koa();

  _applyPlugins('middleware.before');
  applyMiddlewares(plugins, pluginArgs, app);
  app.use(require('koa-static-with-post')(cwd));
  app.use(require('koa-serve-index')(cwd, {
    hidden: true,
    view: 'details',
  }));
  _applyPlugins('middleware.after');

  _applyPlugins('server.before');
  const server = http.createServer(app.callback());
  server.listen(port, () => {
    // Fix log, #8
    var stream = process.stderr;
    if (stream.isTTY) {
      stream.cursorTo(0);
      stream.clearLine(1);
    }

    log.info('dora', `listened on ${port}`);
    _applyPlugins('server.after');
  });
}
