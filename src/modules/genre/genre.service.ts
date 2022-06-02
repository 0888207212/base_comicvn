import { Injectable } from '@nestjs/common';
import { GenreRepository } from './genre.repository';
import { IGenre } from './genre.interface';
import { CreateGenreDto } from './genre.dto';
import { ComicRepository } from '../comic/comic.repository';

@Injectable()
export class GenreService {
  constructor(
    private readonly genreRepository: GenreRepository,
    private readonly comicRepository: ComicRepository,
  ) {}

  async index(isHideCopyrightContent: boolean): Promise<IGenre[]> {
    if (!isHideCopyrightContent) {
      return this.genreRepository.findAll();
    }
    const genres = await this.genreRepository.findAll();
    const notEmptyGenres = [];
    await Promise.all(
      genres.map(async (genre) => {
        const count = await this.comicRepository.count({
          genreIds: genre.id,
          isCopyrightedComic: false,
        });
        if (count !== 0) {
          genre.total = count;
          notEmptyGenres.push(genre);
        }
      }),
    );
    return notEmptyGenres;
  }

  create(input: CreateGenreDto): Promise<IGenre> {
    return this.genreRepository.create(input);
  }
}
