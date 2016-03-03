var a = '';

module.exports = {
  name: 'async',
  'middleware.before': function() {
    return new Promise(resolve => {
      process.nextTick(() => {
        a = `${this.get('prefix') || ''}async-${this.query.affix}`;
        resolve();
      });
    });
  },
  'middleware': function() {
    return function *(next) {
      if (this.url.indexOf('/async') > -1) {
        this.body = a;
        return;
      }
      yield next;
    };
  },
};
