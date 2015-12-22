
# How to write a dora plugin

---

not completed.


## Plugin properties and methods

### Properties

- `port` - String
- `cwd` - String
- `log` - Object
- `localIP` - String
- `originQuery` - String
- `query` - Object

### Methods

- `log.(debug,info,warn,error)` - Function
- `applyPlugins`- Function

## Plugin Example

```javascript
export default {
  'middleware.before': () => {},
  'middleware': (args, pluginArgs) => {
    return (next) => {
      next();
    };
  },
}
```

use generator

````js
export default {
  *'middleware.before'() {
    yield new Promise(resolve, reject) {
      setTimeout(resolve, 2000); // wait for 2 seconds
    }
  }
}
````

Methods:

- `middleware.before`
- `middleware`
- `middleware.after`
- `server.before`
- `server.after`
- `process.exit`

