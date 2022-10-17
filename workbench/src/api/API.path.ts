export enum APIPath {
  auth_currentAccount = 'auth/current-account',
  auth_logout = 'auth/logout',
  system_dict = 'system/dict',

  application_detail = 'application/detail/:applicationId?releaseId=:releaseId',
  org_detail = 'org/detail/:orgId',
  componentInstance_addChild = 'POST component-instance/add-child',
  componentInstance_remove = 'component-instance/remove/:instanceId',
  componentPrototype_detail = 'component-prototype/detail/:componentId?versionId=:versionId',
  component_list = 'component/list',
  component_add = 'POST component/add',
  componentVersion_add = 'POST component-version/add',
  componentVersion_publish = 'POST component-version/publish',
  componentInstance_rootDetail = 'component-instance/root-detail/:instanceId',
  componentInstance_addRoot = 'POST component-instance/add-root',
  componentInstance_reverseDetectId = 'component-instance/reverse-detect-id',
  release_add = 'POST release/add',
  release_detail = 'release/detail/:releaseId',
  asset_build = 'POST asset/build',
  asset_deploy = 'POST asset/deploy',
  item_update = 'POST item/update',
  item_add = 'POST item/add',
  item_remove = 'item/remove/:itemId',
  block_update = 'POST block/update',
  block_add = 'POST block/add',
  block_remove = 'block/remove/:blockId',
  block_listStructPrimaryItem_save = 'POST block/list-struct-primary-item/save',
  group_remove = 'group/remove/:groupId',
  group_update = 'POST group/update',
  group_add = 'POST group/add',
  value_abstractType_add = 'POST value/abstract-type/add',
  value_abstractType_remove = 'value/abstract-type/remove/:propValueId',
  value_update = 'POST value/update',
  move_position = 'POST move/position',
}
