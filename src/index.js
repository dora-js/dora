import polyfill from 'babel-polyfill'; // eslint-disable-line
import http from 'http';
import koa from 'koa';
import { resolvePlugins, applyPlugins, applyPluginsSync, applyMiddlewares } from './plugin';
import assign from 'object-assign';
import log from 'spm-log';
import co from 'co';

const defaultCwd = process.cwd();
const defaultArgs = {
  port: '8000',
  cwd: defaultCwd,
  resolveDir: [defaultCwd],
};

export default function createServer(_args) {
  const args = assign({}, defaultArgs, _args);
  log.config(args);

  const { plugins: pluginNames, port, cwd } = args;
  const pluginArgs = {
    port,
    cwd,
  };
  const plugins = resolvePlugins(pluginNames, args.resolveDir, args.cwd);

  function* _applyPlugins(name, applyArgs) {
    return yield applyPlugins(plugins, name, pluginArgs, applyArgs);
  }

  function _applyPluginsSync(name, applyArgs) {
    return applyPluginsSync(plugins, name, pluginArgs, applyArgs);
  }

  pluginArgs.applyPlugins = _applyPluginsSync;
  pluginArgs.applyPluginsAsync = _applyPlugins;

  log.debug('dora', `[plugins] ${JSON.stringify(plugins)}`);
  const app = koa();

  co(function* runApplyPlugins() {
    yield _applyPlugins('middleware.before');
    yield applyMiddlewares(plugins, pluginArgs, app);
    app.use(require('koa-static-with-post')(cwd));
    app.use(require('koa-serve-index')(cwd, {
      hidden: true,
      view: 'details',
    }));
    yield _applyPlugins('middleware.after');

    const server = http.createServer(app.callback());
    pluginArgs.server = server; // pass server to plugin
    yield _applyPlugins('server.before');

    yield new Promise((resolve, reject) => {
      server.listen(port, resolve);
      server.on('clientError', reject);
    });

    const stream = process.stderr;
    if (stream.isTTY) {
      stream.cursorTo(0);
      stream.clearLine(1);
    }

    log.info('dora', `listened on ${port}`);
    yield _applyPlugins('server.after');
  }).then(() => {
    log.debug('dora', 'dora started.');
  }, (err) => {
    log.error('dora', err);
  });

  process.on('exit', () => {
    _applyPluginsSync('process.exit');
  });

  process.on('SIGINT', () => {
    process.exit(0);
  });

  process.on('uncaughtException', () => {
    process.exit(-1);
  });
}
