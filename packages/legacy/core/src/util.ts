export function emitStatNameForProp(key: string) {
  return [`${key}_prop_stat`, `set_${key}_prop_stat`];
}