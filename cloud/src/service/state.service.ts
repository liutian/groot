import { pick, StateCategory } from '@grootio/common';
import { FilterQuery, RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { ComponentInstance } from 'entities/ComponentInstance';
import { State } from 'entities/State';


@Injectable()
export class StateService {

  async add(rawState: State) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(rawState.name, 'name');
    LogicException.assertParamEmpty(rawState.releaseId, 'releaseId');
    rawState.type && LogicException.assertEnum(StateCategory, 'type', rawState.type);

    const release = await em.findOne(ComponentInstance, rawState.releaseId);
    LogicException.assertNotFound(release, 'Release', rawState.releaseId);
    let instance;
    if (rawState.instanceId) {
      instance = await em.findOne(ComponentInstance, { id: rawState.instanceId, release });
      LogicException.assertNotFound(instance, 'ComponentInstance', `id = ${rawState.instanceId} and releaseId = ${release.id}`);
    }

    const query: FilterQuery<State> = {
      name: rawState.name,
      release,
    }
    if (rawState.instanceId) {
      query.$or = [
        { componentInstance: instance },
        { componentInstance: { id: 0 } }
      ]
    }
    const stateUnique = await em.count(State, query);
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
      const query: FilterQuery<State> = {
        name: rawState.name,
        release: state.release,
      }
      if (rawState.instanceId) {
        query.$or = [
          { componentInstance: state.componentInstance },
          { componentInstance: { id: 0 } }
        ]
      }
      const stateUnique = await em.count(State, query);

      if (stateUnique > 0) {
        throw new LogicException('名称重复', LogicExceptionCode.NotUnique);
      }
    }

    pick(rawState, ['name', 'value', 'type'], state);

    await em.flush();

    return state;
  }
}



