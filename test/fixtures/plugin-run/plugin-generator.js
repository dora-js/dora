
var a = '';

module.exports = {
  name: 'async',
  *'middleware.before'() {
    yield new Promise((resolve) => {
      process.nextTick(() => {
        a = `generator-${this.query.affix}`;
        resolve();
      });
    });
  },
  'middleware'() {
    return function *(next) {
      if (this.url.indexOf('/generator') > -1) {
        this.body = a;
        return;
      }
      yield next;
    };
  },
};
