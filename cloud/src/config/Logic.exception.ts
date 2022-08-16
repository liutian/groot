import { HttpException, HttpStatus } from "@nestjs/common";

// 自定义业务异常
export enum LogicExceptionCode {
  NotFound = 1000,
  UnExpect = 1001,
  NotUnique = 1002,
  ParamError = 1003,
  ParamEmpty = 1004
}

export class LogicException extends HttpException {
  constructor(public message: string, public code: LogicExceptionCode) {
    super(message, code);
  }

  getStatus(): number {
    return HttpStatus.OK;
  }
}

