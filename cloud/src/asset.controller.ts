import { Controller, Get, Param } from '@nestjs/common';
import { AssetService } from 'service/asset.service';
import { EnvType } from '@grootio/common';


@Controller('/asset')
export class AssetController {
  constructor(
    private readonly assetService: AssetService
  ) { }


  @Get('/instance/:instanceId')
  async instanceDetail(@Param('instanceId') instanceId: number) {
    return this.assetService.instanceDetail(instanceId);
  }

  @Get('/application/:appKey/:appEnv')
  async applicationDetail(@Param('appKey') appKey: string, @Param('appEnv') appEnv: EnvType) {
    return this.assetService.appReleaseDetail(appKey, appEnv);
  }

}
