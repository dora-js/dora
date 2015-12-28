# How To Write A Dora Plugin

## Example

Code below shows a plugin with middleware which logging requests.

```javascript
module.exports = {
  name: 'log',
  middleware: function() {
    return function *(next) {
      console.log(this.method + ':' + this.url);
      yield next;
    }
  }
}
```

More Examples:

- [sync plugin](../test/fixtures/plugin-run/plugin-sync.js)
- [async plugin](../test/fixtures/plugin-run/plugin-async.js)
- [generator plugin](../test/fixtures/plugin-run/plugin-generator.js)
- [dora-plugin-proxy](https://github.com/dora-js/dora-plugin-proxy/blob/master/src/index.js)
- [dora-plugin-atool-build](https://github.com/dora-js/dora-plugin-atool-build/blob/master/src/index.js)
- [dora-plugin-hmr](https://github.com/dora-js/dora-plugin-hmr/blob/master/src/index.js)

## Async Plugin

Use `this.callback` or `generator` to write async plugin.

### this.callback

```javascript
module.exports = {
  'server.after': function() {
    startLivereloadServer(function() {
      this.callback();
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

## Plugin methods

Methods that can be extend.

### middleware.before
### middleware
### middleware.after
### server.before
### server.after
### process.exit

## Plugin context

This stuff is available on `this` in a plugin.

### port

Dora server port. Default: 8000.

### cwd

Project cwd.

### localIP

Local IP.

### app

Koa app.

### server

HTTP Server instance. Only avaiable in `server.before` and `server.after`.

### log

An object with 4 methods, `debug`, `info`, `warn`, `error`.

### query

An object. The query of the plugin.

For example, command `dora --plugins proxy?port=9000&verbose`, then you can get query object `{port:9000,verbose:true}` .

### callback

Async control with `this.callback` .
