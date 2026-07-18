export function ah(fn) {
  return (...args) => {
    const next = args[2];
    Promise.resolve(fn(...args)).catch(next);
  };
}
