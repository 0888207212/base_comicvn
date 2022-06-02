import * as dotenv from 'dotenv';
dotenv.config();
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { IConfig } from 'config';
import * as fs from 'fs';
import { Logger } from 'nestjs-pino';
import { CONFIG } from './modules/config/config.provider';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
    cors: true,
  });
  const config = app.get<IConfig>(CONFIG);
  const logger = app.get(Logger);

  app.useLogger(logger);
  app.useGlobalFilters(new HttpExceptionFilter());

  await Promise.all([initializeApp(app), initializeSwagger(app)]);
  await app.listen(config.get<number>('server.port'));

  logger.log(`Application is running at ${config.get<string>('server.hostname')}`);
  logger.log(
    `API Base Path: ${config.get<string>('server.hostname')}${config.get<string>(
      'service.baseUrl',
    )}`,
  );
  logger.log(
    `API Swagger: ${config.get<string>('server.hostname')}${config.get<string>(
      'service.docsBaseUrl',
    )}`,
  );
}

async function initializeApp(app: NestExpressApplication) {
  const config = app.get<IConfig>(CONFIG);

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.setGlobalPrefix(config.get('service.baseUrl'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      disableErrorMessages: false,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.setGlobalPrefix(config.get('service.baseUrl'));

  app.setBaseViewsDir(join(__dirname, '..', '/public/views'));
  app.setViewEngine('hbs');
}

async function initializeSwagger(app: INestApplication) {
  const config = app.get<IConfig>(CONFIG);
  const serviceName = config.get<string>('service.name');
  const serviceDescription = config.get<string>('service.description');
  const apiVersion = config.get<string>('api.apiVersion');

  const options = new DocumentBuilder()
    .setTitle(`${serviceName} API spec`)
    .setDescription(serviceDescription)
    .setVersion(apiVersion)
    .addServer(`${config.get('server.swaggerSchema')}://${config.get('server.hostname')}`)
    .addApiKey(null, 'access-token')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  writeSwaggerJson(`${process.cwd()}`, document);
  SwaggerModule.setup(config.get<string>('service.docsBaseUrl'), app, document, {
    swaggerOptions: {
      displayOperationId: true,
      persistAuthorization: true,
    },
  });
}

const writeSwaggerJson = (path: string, document) => {
  const swaggerFile = `${path}/swagger.json`;
  fs.writeFileSync(swaggerFile, JSON.stringify(document, null, 2), {
    encoding: 'utf8',
  });
};

bootstrap();
