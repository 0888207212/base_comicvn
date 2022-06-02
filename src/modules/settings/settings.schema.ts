import { getBaseSchema } from '../../shared/mongoose';
import { ISetting } from './settings.interface';

const SettingSchema = getBaseSchema<ISetting>();

SettingSchema.add({
  topic: {
    type: String,
    unique: true,
  },
  settings: {
    type: Object,
    default: {},
  },
});

export { SettingSchema };
