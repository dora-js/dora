import resolve from 'resolve';

function tryResolve(id, dirname) {
  let result;
  try {
    result = resolve.sync(id, {
      basedir: dirname,
    });
  } catch(e) {}
  return result;
}

export default function(id, resolveDir) {
  if (!Array.isArray(resolveDir)) {
    resolveDir = [resolveDir];
  }

  let result;
  resolveDir.some(dirname => {
    result = tryResolve(id, dirname) || tryResolve(`dora-plugin-${id}`, dirname);
    return result;
  });
  return result;
}
