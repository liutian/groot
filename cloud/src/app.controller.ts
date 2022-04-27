import { RequestContext } from '@mikro-orm/core';
import { Controller, Get, Param } from '@nestjs/common';
import { StudioGroup } from 'entities/StudioGroup';
import { AppService } from './app.service';
@Controller('/studio')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/detail/:key')
  getHello(@Param('key') key: string): any {
    return {
      /** mock - 请求项目信息 */
      name: 'mockName',
      key: 'mockKey',
      pages: [
        {
          name: 'demo1',
          path: '/groot/page1',
          metadata: {
            moduleName: 'Button_text',
            packageName: 'antd',
            componentName: 'Button',
            props: [{ key: 'children', defaultValue: 'hello world!' }]
          }
        }
      ]
    };
  }

  @Get()
  run() {
    const em = RequestContext.getEntityManager();
    const group = new StudioGroup();
    em.persistAndFlush(group);
  }
}
