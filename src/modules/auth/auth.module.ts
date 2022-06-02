import { HttpModule, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { BookmarkModule } from '../bookmark/bookmark.module';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [UserModule, HttpModule, BookmarkModule, HistoryModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
