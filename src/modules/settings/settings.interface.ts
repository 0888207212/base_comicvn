import { BaseDocument } from '../../shared/mongoose';
import { SettingTopic } from './settings.constant';

export interface ISetting extends BaseDocument {
  topic: SettingTopic;
  settings: Record<any, any>;
}
