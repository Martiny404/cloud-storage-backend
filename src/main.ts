import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { readFile } from 'fs/promises';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exception-filters/all.filter';

async function bootstrap() {
  // const ssl_key = await readFile('/Users/root1/localhost-key.pem');
  // const ssl_cert = await readFile('/Users/root1/localhost.pem');

  // const app = await NestFactory.create(AppModule, {
  // 	httpsOptions: {
  // 		key: ssl_key,
  // 		cert: ssl_cert,
  // 	},
  // });

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);

  app.enableCors({
    credentials: true,
    origin: configService.get('CLIENT'),
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  app.use(cookieParser());

  const PORT = configService.get<number>('PORT') ?? 5020;

  await app.listen(PORT, () =>
    console.log(`REST API запущен успешно на порту: ${PORT}`),
  );
}
bootstrap();
