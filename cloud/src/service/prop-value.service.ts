import { PropBlockStructType, PropItemType, PropValueType } from '@grootio/common';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Component } from 'entities/Component';
import { PropBlock } from 'entities/PropBlock';
import { PropItem } from 'entities/PropItem';
import { PropValue } from 'entities/PropValue';
import { forkTransaction } from 'util.ts/ormUtil';


@Injectable()
export class PropValueService {

}



