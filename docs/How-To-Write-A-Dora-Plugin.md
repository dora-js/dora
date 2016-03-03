# 如何写 Dora 插件

## 入门

下面的例子演示如何通过增加中间件来记录请求。

```javascript
module.exports = {
  name: 'log',
  middleware: function() {
    return function *(next) {
      console.log(this.method + ':' + this.url);
      yield next;
    }
  },
};
```

更多例子:

- [同步](../test/fixtures/plugin-run/plugin-sync.js)
- [异步 callback](../test/fixtures/plugin-run/plugin-async.js)
- [异步 generator](../test/fixtures/plugin-run/plugin-generator.js)
- [插件：dora-plugin-proxy](https://github.com/dora-js/dora-plugin-proxy/blob/master/src/index.js)
- [插件：dora-plugin-atool-build](https://github.com/dora-js/dora-plugin-atool-build/blob/master/src/index.js)
- [插件：dora-plugin-hmr](https://github.com/dora-js/dora-plugin-hmr/blob/master/src/index.js)

## 异步插件

异步插件编写有两种方式：`Promise` 和 `generator`。

### Promise

```javascript
module.exports = {
  'server.after': function() {
    return new Promise(function(resolve) {
      startLivereloadServer(resolve);
    });
  }
}
```

### generator

```javascript
module.exports = {
  'server.after': *function() {
    yield new Promise(function(resolve, reject) {
      startLiverealodServer(function() {
        resolve();
      });
    });
  }
};
```

## 插件方法

### middleware.before
### middleware
### middleware.after
### server.before
### server.after
### process.exit

## 插件上下文

这里的接口都可以通过 `this` 访问到。

### port

Dora 服务器端口，默认 8000 。

### cwd

当前路径，通常是项目根目录。

### set(key, value)

函数，用于设置数据。

### get(key)

函数，用于获取数据。

### app

Koa app 实例。

### server

HTTP Server 实例。只在  `server.before` 和 `server.after` 方法中有效。

### log

类型为 `Object`，包含 4 个方法：`debug`, `info`, `warn`, `error` 。

### query

类型为 `Object`，插件的查询参数。

比如执行命令 `dora --plugins proxy?port=9000&verbose`，那么 proxy 插件的查询参数是 `{port:9000,verbose:true}`。

## 内部数据

### __ready

### __server_listen_log

