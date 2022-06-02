import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CONFIG } from '../config/config.provider';
import { IConfig } from 'config';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(CONFIG) private readonly config: IConfig,
  ) {}
}
