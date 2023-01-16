import { StateType } from '@grootio/common';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { ComponentInstance } from 'entities/ComponentInstance';
import { State } from 'entities/State';
import { pick } from 'util/common';


@Injectable()
export class StateService {

  async add(rawState: State) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(rawState.name, 'name');
    LogicException.assertParamEmpty(rawState.releaseId, 'releaseId');
    rawState.type && LogicException.assertEnum(StateType, 'type', rawState.type);

    const release = await em.findOne(ComponentInstance, rawState.releaseId);
    LogicException.assertNotFound(release, 'Release', rawState.releaseId);
    let instance;
    if (rawState.instanceId) {
      instance = await em.findOne(ComponentInstance, { id: rawState.instanceId, release });
      LogicException.assertNotFound(instance, 'ComponentInstance', `id = ${rawState.instanceId} and releaseId = ${release.id}`);
    }

    const stateUnique = await em.count(State, {
      name: rawState.name,
      release,
      componentInstance: instance
    });
    if (stateUnique > 0) {
      throw new LogicException('名称重复', LogicExceptionCode.NotUnique);
    }

    const newState = em.create(State, {
      ...pick(rawState, ['name', 'type', 'value']),
      release,
      componentInstance: instance
    });

    await em.flush();

    return newState;
  }

  async remove(stateId: number) {
    const em = RequestContext.getEntityManager();

    await em.nativeDelete(State, { id: stateId });
  }

  async update(rawState: State) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(rawState.id, 'id');
    const state = await em.findOne(State, rawState.id);
    LogicException.assertNotFound(state, 'State', rawState.id);

    if (!!rawState.name && rawState.name !== state.name) {
      const stateUnique = await em.count(State, {
        name: rawState.name,
        release: state.release,
        componentInstance: state.componentInstance
      });
      if (stateUnique > 0) {
        throw new LogicException('名称重复', LogicExceptionCode.NotUnique);
      }
    }

    pick(rawState, ['name', 'value', 'type'], state);

    await em.flush();
  }
}



