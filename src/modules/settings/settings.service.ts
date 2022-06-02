import { Injectable } from '@nestjs/common';
import { SettingRepository } from './settings.repository';
import { CreateOrUpdateSettingDto } from './settings.dto';
import { SettingTopic } from './settings.constant';
import { ISetting } from './settings.interface';

@Injectable()
export class SettingsService {
  constructor(private readonly settingRepository: SettingRepository) {}

  async createOrUpdate(settingInput: CreateOrUpdateSettingDto) {
    const currentSetting = await this.settingRepository.findOne({ topic: settingInput.topic });
    return this.settingRepository.updateOneOrCreate(
      { topic: settingInput.topic },
      {
        topic: settingInput.topic,
        settings: {
          ...currentSetting?.settings,
          ...settingInput.settings,
        },
      },
    );
  }

  async readByTopic(topic: SettingTopic): Promise<ISetting> {
    const setting = await this.settingRepository.findOne({ topic });
    if (!setting) {
      return this.settingRepository.create({ topic, settings: {} });
    }
    return setting;
  }
}
