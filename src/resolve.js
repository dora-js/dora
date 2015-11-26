import resolve from 'resolve';

export default function(id, resolveDir) {
  if (!Array.isArray(resolveDir)) {
    resolveDir = [resolveDir];
  }

  let result;
  resolveDir.some(dirname => {
    try {
      result = resolve.sync(id, {
        basedir: dirname,
      });
    } catch(e) {}
    return result;
  });
  return result;
}
