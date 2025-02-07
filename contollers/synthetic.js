import { getInstanceId } from '../aws/aws-actions'
import {
    runPipelineRequest,
    waitForApiReachability,
    waitForInstanceRunning
} from '../utility'

const runSynthetic = async (request) => {
    const { columns } = request

    if (!dataset || !model || !projectId || !userId || !pipeline) {
        throw new Error('Missing Parameters')
    }

    try {
        const instanceId = await getInstanceId(pipeline)

        if (!instanceId) throw new Error('Instance creation failed')
        const { ipAddress } = await waitForInstanceRunning(instanceId)

        await waitForApiReachability({ ipAddress })

        const apiData = buildApiData({
            dataset,
            model,
            userId,
            projectId,
            instanceId,
            ipAddress,
            colInput,
            pipeline
        })

        const response = runPipelineRequest({ ipAddress, pipeline, apiData })
        console.log(response)
    } catch (error) {
        console.error('Error:', err)
    }
}
