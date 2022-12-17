import { MikroORM, RequestContext } from '@mikro-orm/core';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from 'config/all-exceptions.filter';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const orm = app.get(MikroORM);
  app.use((req, res, next) => {
    RequestContext.create(orm.em, next);
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.enableShutdownHooks();
  await app.listen(10000);
}
bootstrap();
