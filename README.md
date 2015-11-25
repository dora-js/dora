# Dora

## Usage

```javascript
import dora from 'dora';
dora({
  plugins: [
    'proxy',
    'atool-build',
  ],
});
```


## Plugin Argument Property

- `port` - String
- `cwd` - String
- `localIP` - String
- `query` - Object
- `originQuery` - String
- `log` - Function
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

Methods:

- `middleware.before`
- `middleware`
- `middleware.after`
- `server.before`
- `server.after`

