[![NPM version](https://img.shields.io/npm/v/dora.svg?style=flat)](https://npmjs.org/package/dora)
[![Build Status](https://img.shields.io/travis/dora-js/dora.svg?style=flat)](https://travis-ci.org/dora-js/dora)
[![Coverage Status](https://img.shields.io/coveralls/dora-js/dora.svg?style=flat)](https://coveralls.io/r/dora-js/dora)
[![NPM downloads](http://img.shields.io/npm/dm/dora.svg?style=flat)](https://npmjs.org/package/dora)

# Dora

![](https://os.alipayobjects.com/rmsportal/UnpjHRTnkJlHfXx.png)

A fully pluggable server for development.

---

## Install

```bash
$ npm i dora -g 
```

## Usage

```bash
## Load proxy, webpack and hmr plugins
$ dora --plugins proxy,webpack,hmr

## Load local plugin
$ dora --plugins ./local-plugin

## Load plugin with arguments
$ dora --plugins foo?optionA=/foo/&optionB

## Load plugin with JSON arguments
$ dora --plugins 'foo?{"optionA":"/foo/","optionB":true}'
```

## Docs

- [How To Write A Dora Plugin](./docs/How-To-Write-A-Dora-Plugin.md)
- [Understand Dora Plugin](./docs/Understand-Dora-Plugin.md)

## License

MIT
