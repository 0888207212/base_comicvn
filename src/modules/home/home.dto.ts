import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { ComicResponseDto } from '../comic/comic.dto';
import { PaginationDto } from '../../adapters/pagination/pagination.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class HomeResponseDto {
  @ApiModelProperty({
    type: [ComicResponseDto],
  })
  feature;

  @ApiModelProperty({
    type: [ComicResponseDto],
  })
  trending;

  @ApiModelProperty({
    type: [ComicResponseDto],
  })
  new;
}

export class SearchComicFilters extends PaginationDto {
  @ApiModelProperty({ type: String })
  @IsNotEmpty()
  searchValue: string;

  @IsOptional()
  @ApiModelPropertyOptional({ type: String })
  genreId?: string;
}

export class TrendingComicFilter extends PaginationDto {}
export class NewComicFilter extends PaginationDto {}
export class RecentlyUpdateComicFilter extends PaginationDto {}
export class TopFilter extends PaginationDto {}

export class CmsIndexComicFilters extends PaginationDto {
  @ApiModelProperty({ type: String })
  @IsOptional()
  searchValue: string;

  @IsOptional()
  @ApiModelPropertyOptional({ type: String })
  genreId?: string;
}
