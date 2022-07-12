import { UIManagerOption } from "./types";

// 默认配置项
const defaultOption: UIManagerOption = {} as any;
// 运行时配置项
export const globalOptions: UIManagerOption = {} as any;

export const setOptions = (customOption: UIManagerOption) => {
  Object.assign(globalOptions, { ...defaultOption }, customOption);
  return globalOptions;
}