
export default {
  middleware() {
    return require('koa-static-with-post')(this.cwd);
  },
};
