import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    operationId: 'health',
    description: 'health check',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Get('health')
  health(): string {
    return this.appService.health();
  }
}
