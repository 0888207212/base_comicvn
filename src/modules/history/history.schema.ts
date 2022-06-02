import { getBaseSchema } from '../../shared/mongoose';
import { IHistory } from './history.interface';

const HistorySchema = getBaseSchema<IHistory>();

HistorySchema.add({
  userId: {
    type: String,
  },
  comicId: {
    type: String,
  },
  lastReadAt: {
    type: Date,
  },
  lastReadChapterId: {
    type: String,
  },
});

export { HistorySchema };
