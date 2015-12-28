
var a = '';

module.exports = {
  name: 'a',
  'middleware.before': function() {
    a = 'foo';
  },
  'middleware': function() {
    return function *(next) {
      if (this.url.indexOf('/foo') > -1) {
        this.body = a;
        return;
      }
      yield next;
    };
  },
};
