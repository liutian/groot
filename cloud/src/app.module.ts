import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { WorkbenchController } from './workbench.controller';
import config from 'config/mikro-orm.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { StandardResultInterceptor } from 'config/standard-result.interceptor';
import { PropBlockService } from 'service/prop-block.service';
import { PropGroupService } from 'service/prop-group.service';
import { PropItemService } from 'service/prop-item.service';
import { ComponentService } from 'service/component.service';
import { ApplicationService } from 'service/application.service';
import { ScaffoldService } from 'service/scaffold.service';
import { CommonService } from 'service/common.service';
@Module({
  imports: [
    MikroOrmModule.forRoot(config)
  ],
  controllers: [WorkbenchController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      // 格式化响应结果
      useClass: StandardResultInterceptor
    },
    PropItemService,
    PropBlockService,
    PropGroupService,
    ComponentService,
    ApplicationService,
    ScaffoldService,
    CommonService
  ],
})
export class AppModule { }
