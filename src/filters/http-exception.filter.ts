import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { createGeneralExceptionError } from '../shared/helpers';

export class HttpExceptionFilter implements ExceptionFilter {
  catch(err: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const responseError = createGeneralExceptionError(err);

    response.status(responseError.statusCode).json(responseError);
  }
}
