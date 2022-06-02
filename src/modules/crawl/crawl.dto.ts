import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CrawlSingleComicDto {
  @ApiModelProperty({ type: String })
  @IsUrl()
  comicUrl: string;

  @ApiModelProperty({ type: Boolean })
  @IsBoolean()
  isCopyrightedComic = true;
}

export class CrawlMultipleComicDto {
  @IsArray()
  @ApiModelProperty({ type: [String] })
  comicUrls: string[];

  @ApiModelProperty({ type: Boolean })
  @IsBoolean()
  isCopyrightedComic = true;
}
