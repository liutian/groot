export const uuid = (() => {
  let id = 0xaaaaaaaa;

  return () => {
    return `u_${(++id).toString(16)}`;
  }
})();