import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@Controller()
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
