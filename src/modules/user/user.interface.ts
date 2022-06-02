import { BaseDocument } from '../../shared/mongoose';
import { UserProvider } from './user.constant';

export interface IUser extends BaseDocument {
  userId: string;
  name: string;
  email: string;
  fcmTokens: string[];
  provider: UserProvider;
}

export interface BufferedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: 'text/csv';
  size: number;
  buffer: Buffer;
}
