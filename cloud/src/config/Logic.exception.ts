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

  static assertNotFound(entity: any, name: string, id?: number | string) {
    if (!entity) {
      let condition = ' where ';
      if (id === undefined) {
        condition = '';
      } else if (typeof id === 'number') {
        condition += `id: ${id}`
      } else {
        condition += id;
      }
      throw new LogicException(`数据 ${name} 未找到，条件 ${condition}`, LogicExceptionCode.NotFound);
    }
  }

  static assertParamEmpty(entity: any, name: string) {
    if (entity === undefined) {
      throw new LogicException(`参数 ${name} 不能为空`, LogicExceptionCode.ParamEmpty);
    }
  }
}


