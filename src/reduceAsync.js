
export default function reduceAsync(arr, memo, iterator, callback) {
  let _memo = memo;
  let index = 0;

  function next() {
    index = index + 1;
    if (arr[index]) {
      return run(arr[index]);  // eslint-disable-line no-use-before-define
    }
    if (callback) callback(null, _memo);
    return _memo;
  }

  function run(item) {
    iterator(_memo, item, (err, result) => {
      _memo = result;
      next();
    });
  }

  return run(arr[index]);
}
