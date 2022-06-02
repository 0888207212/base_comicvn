import { Body, Controller, Get, HttpStatus, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './register.dto';
import { AuthService } from './auth.service';
import {
  AppleLoginDto,
  GoogleLoginDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RequestResetPassword,
  UpdateInfoDto,
} from './login.dto';
import { User } from '../../decorators/user.decorator';
import { IUser } from '../user/user.interface';
import { UseResponseDto } from '../user/use.dto';
import { RequestPlatform } from '../../decorators/platform.decorator';
import { RequestPlatformEnum } from '../user/user.constant';

@Controller()
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    operationId: 'register',
    description: 'register',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UseResponseDto,
  })
  @Post('auth/register')
  register(@Body() registerDto: RegisterDto, @RequestPlatform() platform: RequestPlatformEnum) {
    return this.authService.register(registerDto, platform);
  }

  @ApiOperation({
    operationId: 'login',
    description: 'login',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Post('auth/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    operationId: 'me',
    description: 'me',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UseResponseDto,
  })
  @Get('me')
  me(@User() id: string, @RequestPlatform() platform: RequestPlatformEnum) {
    return this.authService.me(id, platform);
  }

  @ApiOperation({
    operationId: 'logout',
    description: 'logout',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBearerAuth('access-token')
  @Post('auth/logout')
  logout(@User() id: string, @Body() logoutDto: LogoutDto) {
    return this.authService.logout(id, logoutDto);
  }

  @ApiOperation({
    operationId: 'updateInfo',
    description: 'updateInfo',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBearerAuth('access-token')
  @Put('auth/updateInfo')
  updateInfo(@User() id: string, @Body() updateInfoInput: UpdateInfoDto) {
    return this.authService.updateInfo(id, updateInfoInput);
  }

  @ApiOperation({
    operationId: 'refreshToken',
    description: 'refreshToken',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Post('auth/refreshToken')
  refreshToken(@Body() refreshInput: RefreshTokenDto) {
    return this.authService.refreshToken(refreshInput);
  }

  @ApiOperation({
    operationId: 'sendPasswordResetEmail',
    description: 'sendPasswordResetEmail',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Post('auth/sendPasswordResetEmail')
  sendPasswordResetEmail(@Body() resetInput: RequestResetPassword) {
    return this.authService.sendPasswordResetEmail(resetInput);
  }

  @ApiOperation({
    operationId: 'login/google',
    description: 'login/google',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Post('auth/login/google')
  googleLogin(@Body() loginDto: GoogleLoginDto, @RequestPlatform() platform: RequestPlatformEnum) {
    return this.authService.googleLogin(loginDto, platform);
  }

  @ApiOperation({
    operationId: 'login/apple',
    description: 'login/apple',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Post('auth/login/apple')
  appleLogin(@Body() loginDto: AppleLoginDto, @RequestPlatform() platform: RequestPlatformEnum) {
    return this.authService.appleLogin(loginDto, platform);
  }
}
