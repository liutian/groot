import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from 'config/mikro-orm.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { StandardResultInterceptor } from 'config/standardResult.interceptor';
import { StudioBlockService } from 'service/StudioBlock.service';
import { StudioGroupService } from 'service/StudioGroup.service';
@Module({
  imports: [
    MikroOrmModule.forRoot({
      ...config,
      debug: process.env.NODE_ENV !== 'production'
    })
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: StandardResultInterceptor
    },
    StudioBlockService,
    StudioGroupService,
    AppService,
  ],
})
export class AppModule { }
