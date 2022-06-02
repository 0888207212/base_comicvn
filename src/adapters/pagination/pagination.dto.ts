import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumberString } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({
    type: 'integer',
    description: 'Page number',
  })
  page?: number;

  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({
    type: 'integer',
    description: 'Display a limit per page',
  })
  perPage?: number;
}
