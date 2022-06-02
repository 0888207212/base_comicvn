import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { PaginationDto } from '../../adapters/pagination/pagination.dto';

export class CreateBookMarkDto {
  @IsNotEmpty()
  @IsMongoId()
  @ApiModelProperty({
    type: String,
    example: '6134a09d76b22d564da98c13',
  })
  comicId: string;
}

export class BookmarkResponseDto {
  @ApiModelProperty({ type: String })
  userId: string;

  @ApiModelProperty({ type: String })
  comicId: string;

  @ApiModelProperty({ type: Date })
  bookmarkedAt: Date;
}

export class IndexBookmarkFilters extends PaginationDto {}

export class DeleteBookMarkDto {
  @IsNotEmpty()
  @IsMongoId()
  @ApiModelProperty({
    type: String,
    example: '6134a09d76b22d564da98c13',
  })
  comicId: string;
}
