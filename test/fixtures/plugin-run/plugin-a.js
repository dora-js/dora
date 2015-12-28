
var a = '';

module.exports = {
  name: 'a',
  'middleware.before': function() {
    a = 'foo';
    this.log.info('a');
    this.log.warn('a');
    this.log.debug('a');
    this.log.error('a');
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
