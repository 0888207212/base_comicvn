import { IsEmail, IsNotEmpty, Length, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'email',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'name',
  })
  name: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @ApiProperty({
    type: String,
    description: 'password',
  })
  password: string;
}
