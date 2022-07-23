import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Component } from 'entities/Component';
import { Scaffold } from 'entities/Scaffold';


@Injectable()
export class ScaffoldService {

  async getDetail(scaffoldId: number) {
    const em = RequestContext.getEntityManager();
    const scaffold = await em.findOne(Scaffold, scaffoldId);

    scaffold.componentList = await em.find(Component, { scaffold: scaffoldId });

    return scaffold;
  }

}



