
export default {
  middleware() {
    return require('koa-serve-index')(this.cwd, {
      hidden: true,
      view: 'details',
    });
  },
};
