import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UseResponseDto {
  @ApiProperty({
    type: String,
  })
  userId: string;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: String,
  })
  email: string;

  @ApiPropertyOptional({
    type: [String],
  })
  fcmTokens: string[];

  @ApiPropertyOptional({
    type: Number,
  })
  bookmarkCount: number;

  @ApiPropertyOptional({
    type: Number,
  })
  historyCount: number;
}
