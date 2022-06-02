import { getBaseSchema } from '../../shared/mongoose';
import { IUser } from './user.interface';
import { RequestPlatformEnum, UserProvider } from './user.constant';

const UserSchema = getBaseSchema<IUser>();

UserSchema.add({
  userId: {
    type: String,
    require: true,
    unique: true,
  },
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  fcmTokens: {
    type: [String],
  },
  provider: {
    type: String,
    default: UserProvider.Email,
  },
  platform: {
    type: String,
    default: RequestPlatformEnum.SwaggerApi,
  },
});

export { UserSchema };
