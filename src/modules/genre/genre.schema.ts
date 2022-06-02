import { getBaseSchema } from '../../shared/mongoose';
import { IGenre } from './genre.interface';

const GenreSchema = getBaseSchema<IGenre>();

GenreSchema.add({
  name: {
    type: String,
    require: true,
  },
  description: {
    type: String,
  },
  total: {
    type: Number,
    default: 0,
  },
});

export { GenreSchema };
