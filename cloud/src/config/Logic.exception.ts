import { HttpException, HttpStatus } from "@nestjs/common";

export enum LogicExceptionCode {
  NotFound = 1000,
  UnExpect = 1001
}



export class LogicException extends HttpException {
  constructor(public message: string, public code: LogicExceptionCode) {
    super(message, code);
  }

  getStatus(): number {
    return HttpStatus.OK;
  }
}

