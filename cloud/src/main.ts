import { MikroORM, RequestContext } from '@mikro-orm/core';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const orm = app.get(MikroORM);
  app.use((req, res, next) => {
    RequestContext.create(orm.em, next);
  });
  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();
