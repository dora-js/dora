## dora 插件机制简介

文：[羽航](https://github.com/YuhangGe)

dora 本质就是使用 koa 模块启动一个 koa 服务器。通常，我们使用 koa 编写应用时，会有如下的代码流程：

1. 通过 `const app = require('koa')()` 引入模块。
2. 使用 `app.use()` 方法为 `koa` 应用注入中间件。比如我们都知道的 `koa-route`, `koa-static` 等中间件, 也可以是我们自己写的中间件。
3. 调用 `const server = http.createServer(app.callback())` 来创建 http 服务器。
4. 调用 `server.listen(port, callback)` 来启动服务器，其中 callback 是服务器启动完成后的回调，通常我们会在 callback 里面打印 'listen on 127.0.0.1:8000' 这样的信息。

如果你对上面 4 个步骤理解很模糊，请先通过 goolge 了解 koa 及期中间件的使用方法，再来接着阅读下文。

dora 的代码也是上面的 4 个步骤，只不过在这些步骤之间，可以通过插件的方式，动态地加载功能。

为了理解 dora 的插件，我们先结合上述 4 个步骤介绍 dora 的几个事件时间点：

* `middleware.before` ：在步骤 1 和步骤 2 之间执行。
* `middleware` 在步骤 2 中，加载插件中提供的中间件。这个时间点的插件可以处理 http 的网络请求。
* `middleware.after` 在步骤 2 和 3 之间执行。
* `server.before` 在 `middleware.after` 之后，步骤 3 之前执行。
* `server.after` 第 4 步的 callback 回调函数里执行。

整个 dora 的执行逻辑如下（伪代码）：

````js
// 扫描所有需要使用的插件，放到插件列表里。
resolvePlugins();

async.series([
    // 执行所有注册到 middleware.before 时间点的插件。
    next => _applyPlugins('middleware.before', null, next),
    // 执行所有注册到 middleware 时间点的插件，app 实例会传递给插件，用来通过调用`app.use()`注册 koa 中间件。
    next => _applyPlugins('middleware', null, next),
    // 执行所有注册到 middleware.after 时间点的插件。
    next => _applyPlugins('middleware.after', null, next),
    next => { server = context.server = http.createServer(app.callback()); next(); },
    // 执行所有注册到 server.before 时间点的插件。
    next => _applyPlugins('server.before', null, next),
    next => {
      server.listen(port, () => {
        log.info('dora', `listened on ${port}`);
        next();
      });
    },
    // 执行所有注册到 server.after 时间点的插件。
    next => _applyPlugins('server.before', null, next),
  ], callback);
````

那么，dora 的插件是如何注册的呢，特别是如何注册到不同的时间点。其实也很简单，我们以`dora-plugin-atool-build`为例，这个插件就是一个标准的 npm 模块，只有一个入口文件 `index.js`，内容如下(伪代码)：

````js
import webpack;
import koa-webpack-dev-middleware;
let webpackConfig;

module.exports = {
  'middleware.before': () => {
    // 获取默认的 webpack 配置，并和用户项目里面的自定义配置合并。
    webpackConfig = getAndMergeConfig();
  },
  'middleware': (args, pluginArgs) => {
    // 返回 koa-webpack-dev-middleware 组件产生的 koa 中间件。
    const comiper = webpack.compiper(webpackConfig);
    return koa-webpack-dev-middleware(compiper)
  },
  'middleware.after': () => { // do nothing },
  'server.after': () => {
    console.log('dora-plugin-webpack-server ready.');
  }
};
````

从上面代码可以看出，dora 的插件注册也很简单，就是通过如 'middleware.before' 的字符串注册插件到相应的时间点。dora 加载一个插件的模块后，会把其不同时间点的函数注册到不同时间点的插件列表里，`applyPlugins()`执行时，只要把对应时间点的插件列表取出来挨着执行下就行了，整个 dora 的机制还是非常简单的。

需要注意下的是，在插件模块里，`middleware` 这个字段对应的函数，一定要返回一个 koa 的中间件（比如上面的代码里，返回了 koa-webpack-dev-middleware 中间件，也可以返回自己写的中间件，更多细节请查阅 koa 中间件相关资料），dora 会帮你调用 `app.use` 来注册这个返回的中间件；除此外的 `middleware.before`, `middleware.after`, `server.before`, `server.after` 这 4 个时间点的函数，都是普通的任意函数。

最后还剩的一点疑虑是，dora 是如何知道要加载哪些插件呢？

现阶段 dora 不会自动扫描任何目录，你需要通过参数（命令行参数或函数调用参数）明确告知需要哪些插件。

比如执行 `dora -p 8000 --plugins proxy` 会在 `node_modules` 目录下看 `dora-plugin-proxy` 模块是否存在，如果存在则加载；不存在则看 `proxy` 模块是否存在。
