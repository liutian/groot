import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
@Controller('/project')
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
}
