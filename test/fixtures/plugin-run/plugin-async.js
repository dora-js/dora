
var a = '';

module.exports = {
  name: 'async',
  'middleware.before': function() {
    process.nextTick(() => {
      a = `${this.get('prefix') || ''}async-${this.query.affix}`;
      this.callback();
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
