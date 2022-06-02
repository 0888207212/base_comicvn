import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpStatus, Render } from '@nestjs/common';

@Controller('static-renders')
@ApiTags('static-renders')
export class StaticRenderController {
  @ApiOperation({
    operationId: 'policy',
    description: 'policy',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Get('policy')
  @Render('policy.hbs')
  comic() {
    return { message: 'Hello world!' };
  }

  @ApiOperation({
    operationId: 'policyVer2',
    description: 'policyVer2',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Get('/truyen-tranh-tong-hop/policy')
  @Render('policy_v2.hbs')
  comicVer2() {
    return { message: 'Hello world!' };
  }
}
