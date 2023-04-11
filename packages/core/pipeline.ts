import { ExtensionPipelineLevel, ExtScriptModule } from '@grootio/common'

export const propItemPipeline = (entryExtList: ExtScriptModule[], solutionExtList: ExtScriptModule[], releaseExtList: ExtScriptModule[], params: any) => {
  const entryExtMap = new Map<ExtensionPipelineLevel, ExtScriptModule[]>()
  const releaseExtMap = new Map<ExtensionPipelineLevel, ExtScriptModule[]>()
  const solutionExtMap = new Map<ExtensionPipelineLevel, ExtScriptModule[]>()

  const prePipeline = (extList: ExtScriptModule[], extMap: Map<ExtensionPipelineLevel, ExtScriptModule[]>, params: any) => {
    extList.forEach(ext => {
      const level = ext.check(params)
      if (level === ExtensionPipelineLevel.Ignore) {
        return
      }

      if (!extMap.has(level)) {
        extMap.set(level, [])
      }

      extMap.get(level)!.push(ext)
    })
  }

  const pipeline = (extList: ExtScriptModule[], params: any) => {
    const taskIds: number[] = []
    for (const ext of extList) {
      if (taskIds.includes(ext.id)) {
        continue
      }

      const next = ext.task!(params)
      taskIds.push(ext.id)

      if (!next) {
        break
      }
    }
  }



  prePipeline(entryExtList, entryExtMap, params)
  prePipeline(solutionExtList, solutionExtMap, params)
  prePipeline(releaseExtList, releaseExtMap, params)

  pipeline([
    ...(entryExtMap.get(ExtensionPipelineLevel.Hight) || []),
    ...(entryExtMap.get(ExtensionPipelineLevel.Normal) || []),
    ...(entryExtMap.get(ExtensionPipelineLevel.Low) || []),

    ...(solutionExtMap.get(ExtensionPipelineLevel.Hight) || []),
    ...(solutionExtMap.get(ExtensionPipelineLevel.Normal) || []),
    ...(solutionExtMap.get(ExtensionPipelineLevel.Low) || []),

    ...(releaseExtMap.get(ExtensionPipelineLevel.Hight) || []),
    ...(releaseExtMap.get(ExtensionPipelineLevel.Normal) || []),
    ...(releaseExtMap.get(ExtensionPipelineLevel.Low) || []),

  ], params)
}
