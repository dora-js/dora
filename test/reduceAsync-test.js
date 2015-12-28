import reduceAsync from '../src/reduceAsync';
import expect from 'expect';

describe('reduceAsync', () => {

  it('sync', () => {
    let ret = 0;
    reduceAsync([1, 2, 3], 0, function(memo, item, callback) {
      callback(null, memo + item);
    }, function(err, result) {
      ret = result;
    });

    expect(ret).toEqual(6);
  });

  it('async', () => {
    let ret = 0;
    reduceAsync([1, 2, 3], 0, function(memo, item, callback) {
      process.nextTick(function() {
        callback(null, memo + item);
      });
    }, function(err, result) {
      ret = result;
      expect(result).toEqual(6);
    });
    expect(ret).toEqual(0);
  })
});
