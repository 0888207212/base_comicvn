import { IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'email',
  })
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @ApiProperty({
    type: String,
    description: 'password',
  })
  password: string;
}

export class LogoutDto {
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: 'fcmToken to clear' })
  fcmToken?: string;
}

export class UpdateInfoDto {
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: 'fcmToken to update' })
  fcmToken?: string;

  @IsOptional()
  @ApiPropertyOptional({ type: String, description: 'fcmToken to name' })
  name?: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'refresh token',
  })
  refreshToken: string;
}

export class RequestResetPassword {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'email',
  })
  email: string;
}

export class GoogleLoginDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'idToken',
  })
  idToken: string;
}

export class AppleLoginDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'idToken',
  })
  idToken: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'nonce',
  })
  nonce: string;
}
