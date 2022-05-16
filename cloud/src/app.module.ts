import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from 'config/mikro-orm.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { StandardResultInterceptor } from 'config/standardResult.interceptor';
import { StudioBlockService } from 'service/StudioBlock.service';
import { StudioGroupService } from 'service/StudioGroup.service';
import { StudioItemService } from 'service/StudioItem.service';
@Module({
  imports: [
    MikroOrmModule.forRoot(config)
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: StandardResultInterceptor
    },
    StudioItemService,
    StudioBlockService,
    StudioGroupService,
    AppService,
  ],
})
export class AppModule { }
