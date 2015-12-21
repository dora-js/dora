import http from 'http';
import koa from 'koa';
import { resolvePlugins, applyPlugins, applyMiddlewares } from './plugin';
import assign from 'object-assign';
import log from 'spm-log';

const defaultCwd = process.cwd();
const defaultArgs = {
  port: '8000',
  cwd: defaultCwd,
  resolveDir: [defaultCwd],
};

let notDestroy = true;

export default function createServer(_args) {
  const args = assign({}, defaultArgs, _args);
  log.config(args);

  const { plugins: pluginNames, port, cwd } = args;
  const pluginArgs = {
    port,
    cwd,
  };
  const plugins = resolvePlugins(pluginNames, args.resolveDir, args.cwd);
  function _applyPlugins(name, applyArgs) {
    return applyPlugins(plugins, name, pluginArgs, applyArgs);
  }
  pluginArgs.applyPlugins = _applyPlugins;
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

  const server = http.createServer(app.callback());
  pluginArgs.server = server; // pass server to plugin
  _applyPlugins('server.before');

  server.listen(port, () => {
    // Fix log, #8
    const stream = process.stderr;
    if (stream.isTTY) {
      stream.cursorTo(0);
      stream.clearLine(1);
    }

    log.info('dora', `listened on ${port}`);
    _applyPlugins('server.after');
  });


  // exit 事件和 SIGINT 事件是否一定只会发生一次呢? 如果不是, 需要防止多次触发 process.exit
  process.on('exit', () => {
    if (notDestroy) {
      _applyPlugins('process.exit');
    }
    notDestroy = false;
  });

  process.on('SIGINT', () => {
    if (notDestroy) {
      _applyPlugins('process.exit');
    }
    notDestroy = false;
  });
}
