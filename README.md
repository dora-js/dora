[![NPM version](https://img.shields.io/npm/v/dora.svg?style=flat)](https://npmjs.org/package/dora)
[![Build Status](https://img.shields.io/travis/dora-js/dora.svg?style=flat)](https://travis-ci.org/dora-js/dora)
[![Coverage Status](https://img.shields.io/coveralls/dora-js/dora.svg?style=flat)](https://coveralls.io/r/dora-js/dora)
[![NPM downloads](http://img.shields.io/npm/dm/dora.svg?style=flat)](https://npmjs.org/package/dora)

# Dora

![](https://avatars0.githubusercontent.com/u/15991930?v=3&s=200)

A fully pluggable server for development.

---

## Install

```bash
$ npm i dora -g 
```

## Usage

via cli

```bash
$ dora --plugins proxy,atool-build,hmr
```

via api

```javascript
import dora from 'dora';
dora({
  plugins: [
    'proxy',
    'atool-build',
  ],
});
```

## License

MIT

