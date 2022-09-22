import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException } from 'config/logic.exception';
import { Component } from 'entities/Component';
import { Scaffold } from 'entities/Scaffold';


@Injectable()
export class ScaffoldService {

  async getDetail(scaffoldId: number) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(scaffoldId, 'scaffoldId');
    const scaffold = await em.findOne(Scaffold, scaffoldId);
    LogicException.assertNotFound(scaffold, 'scaffold', scaffoldId);

    scaffold.componentList = await em.find(Component, { scaffold: scaffoldId });

    return scaffold;
  }

}



