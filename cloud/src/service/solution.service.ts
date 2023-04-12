import { ExtensionRelationType } from '@grootio/common';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException } from 'config/logic.exception';
import { ExtensionInstance } from 'entities/ExtensionInstance';
import { Solution } from 'entities/Solution';
import { SolutionVersion } from 'entities/SolutionVersion';


@Injectable()
export class SolutionService {

  async getDetail(rawSolution: Solution) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(rawSolution.id, 'solutionId');
    const solution = await em.findOne(Solution, rawSolution.id);
    LogicException.assertNotFound(solution, 'Solution', rawSolution.id);

    const solutionVersionId = rawSolution.solutionVersionId || solution.recentVersion.id
    const solutionVersion = await em.findOne(SolutionVersion, solutionVersionId)
    LogicException.assertNotFound(solutionVersion, 'SolutionVersion', solutionVersionId);

    solution.solutionVersion = solutionVersion

    solution.extensionInstanceList = await em.find(ExtensionInstance, {
      relationType: ExtensionRelationType.SolutionVersion,
      relationId: solutionVersion.id
    }, { populate: ['extension', 'extensionVersion.propItemPipelineRaw'] })

    return solution;
  }

}



