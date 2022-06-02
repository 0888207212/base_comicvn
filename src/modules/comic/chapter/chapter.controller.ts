import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChapterResponseDto, CreateChapterDto } from '../comic.dto';
import { ComicService } from '../comic.service';
import { User } from '../../../decorators/user.decorator';

@Controller('chapters')
@ApiTags('chapters')
export class ChapterController {
  constructor(private readonly comicService: ComicService) {}

  @ApiOperation({
    operationId: 'showChapter',
    description: 'Show chapter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ChapterResponseDto,
  })
  @ApiBearerAuth('access-token')
  @Get(':chapterId')
  show(@User() userId, @Param('chapterId') chapterId: string) {
    return this.comicService.showChapter(chapterId, userId);
  }

  @ApiOperation({
    operationId: 'updateChapter',
    description: 'Update chapter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ChapterResponseDto,
  })
  @Put(':chapterId')
  update(@Param('chapterId') chapterId: string, @Body() createChapterInput: CreateChapterDto) {
    return this.comicService.updateChapter(chapterId, createChapterInput);
  }

  @ApiOperation({
    operationId: 'updateChapter',
    description: 'Update chapter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ChapterResponseDto,
  })
  @Delete(':chapterId')
  delete(@Param('chapterId') chapterId: string) {
    return this.comicService.deleteChapter(chapterId);
  }
}
