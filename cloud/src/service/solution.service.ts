import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException } from 'config/logic.exception';
import { Solution } from 'entities/Solution';


@Injectable()
export class SolutionService {

  async getDetail(solutionId: number) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(solutionId, 'solutionId');
    const solution = await em.findOne(Solution, solutionId, { populate: ['extensionList'] });
    LogicException.assertNotFound(solution, 'Solution', solutionId);

    return solution;
  }

}



