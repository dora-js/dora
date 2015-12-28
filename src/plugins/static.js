
export default {
  middleware() {
    return require('koa-static')(this.cwd);
  },
};
