import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Component } from 'entities/Component';
import { ComponentInstance } from 'entities/ComponentInstance';
import { ComponentVersion } from 'entities/ComponentVersion';
import { Project } from 'entities/Project';
import { Release } from 'entities/Release';
import { StudioBlock } from 'entities/StudioBlock';
import { StudioGroup } from 'entities/StudioGroup';
import { StudioItem } from 'entities/StudioItem';
import { omitProps } from 'util.ts/ormUtil';


@Injectable()
export class AppService {


}



