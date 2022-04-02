export const uuid = (() => {
  let id = 0xaaaaaaaa;

  return () => {
    return (++id).toString(16);
  }
})();