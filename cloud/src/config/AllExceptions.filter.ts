import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

import { LogicException } from './Logic.exception';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {

  catch(exception: HttpException | LogicException | Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof LogicException) {
      response.status(HttpStatus.OK).json({
        code: exception.code,
        message: exception.message,
        // todo ...
      })
      // todo **log**
    } else {
      super.catch(exception, host);
    }

  }
}
