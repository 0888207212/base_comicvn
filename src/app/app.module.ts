import { Inject, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { IConfig } from 'config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '../modules/config/config.module';
import { createMongooseOptions, createRedisOptions } from '../shared/helpers';
import { CommonModule } from '../modules/common/common.module';
import { CONFIG } from '../modules/config/config.provider';
import { LoggerModule } from 'nestjs-pino';
import { UserModule } from '../modules/user/user.module';
import { FireBaseAuthMiddleware } from '../middlewares/firebase.auth.middleware';
import { AuthModule } from '../modules/auth/auth.module';
import { FirebaseAdminModule } from '@aginix/nestjs-firebase-admin';
import * as admin from 'firebase-admin';
import { getConfig } from '../modules/common/config.provider';
import { GenreModule } from '../modules/genre/genre.module';
import { ComicModule } from '../modules/comic/comic.module';
import { FirebaseClientModule } from '../modules/firebaseClient/firebaseClient.module';
import { HomeModule } from '../modules/home/home.module';
import { BookmarkModule } from '../modules/bookmark/bookmark.module';
import { CrawlModule } from '../modules/crawl/crawl.module';
import { BullModule } from '@nestjs/bull';
import { NotificationModule } from '../modules/notification/notification.module';
import { HistoryModule } from '../modules/history/history.module';
import { StaticRenderModule } from '../modules/staticRender/staticRender.module';
import { SettingsModule } from '../modules/settings/settings.module';
const config = getConfig();
const serviceAccount = JSON.parse(config.get('firebase.admin'));

@Module({
  imports: [
    BullModule.forRootAsync({ useFactory: () => createRedisOptions('redis') }),
    MongooseModule.forRootAsync({
      useFactory: () => createMongooseOptions('mongodb.uri'),
    }),
    FirebaseAdminModule.forRootAsync({
      useFactory: () => ({
        credential: admin.credential.cert(serviceAccount),
      }),
    }),
    ComicModule,
    GenreModule,
    AuthModule,
    UserModule,
    ConfigModule,
    FirebaseClientModule,
    CommonModule,
    HomeModule,
    BookmarkModule,
    CrawlModule,
    NotificationModule,
    HistoryModule,
    StaticRenderModule,
    SettingsModule,
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => req.id,
        prettyPrint: true,
        formatters: {
          level: (label: string, number: number) => ({ label, number }),
          bindings: (bindings) => ({ pid: bindings.pid }),
        },
        redact: {
          censor: '-',
          paths: ['req.headers.cookie'],
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(@Inject(CONFIG) private readonly configService: IConfig) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FireBaseAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
