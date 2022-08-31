import { Controller, Get, Param } from '@nestjs/common';
import { AssetService } from 'service/asset.service';
import { AssetType } from '@grootio/common';


@Controller('/asset')
export class AssetController {
  constructor(
    private readonly assetService: AssetService
  ) { }


  @Get('/instance/:instanceId')
  async assetInstanceDetail(@Param('instanceId') instanceId: number) {
    return this.assetService.detail(AssetType.Instance, instanceId);
  }

  @Get('/application/:applicationId')
  async assetApplicationDetail(@Param('applicationId') applicationId: number) {
    return this.assetService.detail(AssetType.Application, applicationId);
  }

}
