import resolve from 'resolve';

function tryResolve(id, dirname) {
  let result;
  try {
    result = resolve.sync(id, {
      basedir: dirname,
    });
  } catch (e) {} // eslint-disable-line no-empty
  return result;
}

export default function(id, _resolveDir) {
  let resolveDir = _resolveDir;
  if (!Array.isArray(resolveDir)) {
    resolveDir = [resolveDir];
  }

  let result;
  resolveDir.some(dirname => {
    result = tryResolve(`dora-plugin-${id}`, dirname) || tryResolve(id, dirname);
    return result;
  });
  return result;
}
