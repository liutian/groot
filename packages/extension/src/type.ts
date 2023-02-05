import { ComponentInstance } from "@grootio/common"

export type CommandType = {
  'groot.hello': [[string], void],
}

export type StateType = {
  'groot.instance': ComponentInstance
}