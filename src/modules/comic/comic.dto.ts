import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { Decimal128 } from 'bson';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';
import { getNow } from '../../shared/time-helpers';
import { PaginationDto } from '../../adapters/pagination/pagination.dto';
import { Sort } from './comic.constant';
import { getEnumValues } from '@nestjs/swagger/dist/utils/enum.utils';

export class ComicResponseDto {
  @ApiModelProperty()
  name: string;

  @ApiModelProperty()
  rating: Decimal128;

  @ApiModelProperty()
  views: Decimal128;

  @ApiModelProperty()
  numberOfChapters: number;

  @ApiModelPropertyOptional()
  firstChapterId?: string;

  @ApiModelProperty()
  author: string;

  @ApiModelProperty()
  genres: string[];

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty()
  isFollowed: boolean;

  @ApiModelPropertyOptional()
  lastReadChapterId?: string;

  @ApiModelPropertyOptional()
  lastReadChapterIndexSort?: string;

  @ApiModelPropertyOptional()
  lastReadChapterName?: string;
}

export class CreateComicDto {
  @IsNotEmpty()
  @ApiModelProperty({
    example: 'The Iceblade Magician Rules Over The World',
  })
  name: string;

  @IsNotEmpty()
  @ApiModelProperty({
    example:
      'Học viện ma thuật Arnold, một ngôi trường danh giá đã sản sinh ra rất nhiều pháp sư vĩ đại. Một cậu bé, Ray White, quyết định theo học với tư cách là phù thủy duy nhất từ một gia đình bình thường. Anh ta được bao quanh bởi những sinh viên từ các gia đình quý tộc và các pháp sư luôn xa lánh anh ta. Nhưng mọi người không biết. Anh ta là người đã lập được rất nhiều thành tích trong cuộc chiến ở Viễn Đông trước đây, và hiện tại anh ta được cho là người mạnh nhất trong bảy đại pháp sư trên thế giới. Dù bị phớt lờ với tư cách là một pháp sư nhưng cuối cùng anh ta sẽ thể hiện sức mạnh của mình với những người xung quanh?',
  })
  description: string;

  @IsNotEmpty()
  @ApiModelProperty({
    example: 'Mikoshiba Nana',
  })
  author: string;

  @IsOptional()
  @IsUrl()
  @ApiModelPropertyOptional({
    example:
      'http://i.truyenvua.com/ebook/190x247/the-iceblade-magician-rules-over-the-world_1598159147.jpg?r=r8645456',
  })
  thumbnail: string;

  @IsArray()
  @IsMongoId({ each: true })
  @ApiModelPropertyOptional({
    example: ['613494138ac3945047a52c26'],
  })
  genreIds: string[];

  @IsOptional()
  @ApiModelProperty({
    example: 'truyenqq.net',
  })
  source: string;

  @IsNotEmpty()
  @IsUrl()
  @ApiModelProperty()
  urlSource: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiModelProperty({ default: true })
  isCopyrightedComic: boolean;
}

export class CreateChapterDto {
  @IsArray()
  @ApiModelPropertyOptional({
    example: [
      'http://i.truyenvua.com/ebook/190x247/the-iceblade-magician-rules-over-the-world_1598159147.jpg?r=r8645456',
    ],
  })
  images: string[];

  @IsNotEmpty()
  @ApiModelProperty({
    example: 'Chapter 1',
  })
  name: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiModelProperty({
    example: getNow(),
  })
  publishDate: Date;

  @IsNotEmpty()
  @IsUrl()
  @ApiModelProperty()
  urlSource: string;

  @IsInt()
  @Min(1)
  @ApiModelProperty({ example: 1 })
  indexSort: number;
}

export class ChapterResponseDto {
  @ApiModelPropertyOptional({
    example: [
      'http://i.truyenvua.com/ebook/190x247/the-iceblade-magician-rules-over-the-world_1598159147.jpg?r=r8645456',
    ],
  })
  images: string[];

  @ApiModelProperty({
    example: 'Chapter 1',
  })
  name: string;

  @ApiModelProperty({
    example: getNow(),
  })
  publishDate: Date;

  @ApiModelProperty({
    example: 100,
  })
  views: Decimal128;

  @ApiModelProperty()
  comicId: string;

  @ApiModelProperty()
  source: string;

  @ApiModelProperty()
  isRequiredReferer: boolean;

  @ApiModelPropertyOptional()
  nextChapter?: string;

  @ApiModelPropertyOptional()
  prevChapter?: string;
}

export class IndexChapterFilter extends PaginationDto {
  @IsOptional()
  @ApiModelPropertyOptional({ type: String, enum: getEnumValues(Sort) })
  sort?: Sort;
}

export class UpdateComicDto {
  @IsNotEmpty()
  @ApiModelProperty({
    example: 'The Iceblade Magician Rules Over The World',
  })
  name: string;

  @IsNotEmpty()
  @ApiModelProperty({
    example:
      'Học viện ma thuật Arnold, một ngôi trường danh giá đã sản sinh ra rất nhiều pháp sư vĩ đại. Một cậu bé, Ray White, quyết định theo học với tư cách là phù thủy duy nhất từ một gia đình bình thường. Anh ta được bao quanh bởi những sinh viên từ các gia đình quý tộc và các pháp sư luôn xa lánh anh ta. Nhưng mọi người không biết. Anh ta là người đã lập được rất nhiều thành tích trong cuộc chiến ở Viễn Đông trước đây, và hiện tại anh ta được cho là người mạnh nhất trong bảy đại pháp sư trên thế giới. Dù bị phớt lờ với tư cách là một pháp sư nhưng cuối cùng anh ta sẽ thể hiện sức mạnh của mình với những người xung quanh?',
  })
  description: string;

  @IsNotEmpty()
  @ApiModelProperty({
    example: 'Mikoshiba Nana',
  })
  author: string;

  @IsOptional()
  @IsUrl()
  @ApiModelPropertyOptional({
    example:
      'http://i.truyenvua.com/ebook/190x247/the-iceblade-magician-rules-over-the-world_1598159147.jpg?r=r8645456',
  })
  thumbnail: string;

  @IsArray()
  @IsMongoId({ each: true })
  @ApiModelPropertyOptional({
    example: ['613494138ac3945047a52c26'],
  })
  genreIds: string[];

  @IsOptional()
  @ApiModelProperty({
    example: 'truyenqq.net',
  })
  source: string;

  @IsNotEmpty()
  @IsUrl()
  @ApiModelProperty()
  urlSource: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiModelProperty({ default: true })
  isCopyrightedComic: boolean;
}
