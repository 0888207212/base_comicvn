import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationDto } from '../../adapters/pagination/pagination.dto';

export class GenreResponseDto {
  @ApiModelProperty({
    example: 'Active',
  })
  name: string;

  @ApiModelProperty({
    example:
      'Thể loại này thường có nội dung về đánh nhau, bạo lực, hỗn loạn, với diễn biến nhanh\n',
  })
  description: string;

  @ApiModelProperty({
    type: Number,
    example: 100,
  })
  total: number;
}

export class CreateGenreDto {
  @IsNotEmpty()
  @ApiModelProperty({
    example: 'Active',
  })
  name: string;

  @IsOptional()
  @ApiModelProperty({
    example: 'Thể loại này thường có nội dung về đánh nhau, bạo lực, hỗn loạn, với diễn biến nhanh',
  })
  description: string;
}

export class IndexComicByGenreFilters extends PaginationDto {}
