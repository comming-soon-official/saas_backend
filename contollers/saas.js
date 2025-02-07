import { getInstanceId } from '../aws/aws-actions'
import {
    buildApiData,
    runPipelineRequest,
    waitForApiReachability,
    waitForInstanceRunning
} from '../utility'
import { saveInstanceId, saveStatus } from '../cloud/main'

export const runSaas = async (request) => {
    const { dataset, model, projectId, userId, pipeline, colInput, app } =
        request

    let missing_data = []

    if (!projectId) {
        missing_data.push('projectId')
    }

    if (!userId) {
        missing_data.push('userId')
    }

    if (!ipAddress) {
        missing_data.push('ipAddress')
    }
    if (!pipeline) {
        missing_data.push('pipeline')
    }
    if (missing_data.length > 0) {
        if (projectId && userId) {
            await saveProjectDetailsByID(
                projectId,
                'error',
                null,
                `Missing required parameters: ${missing_data.join(', ')}`
            )
        }
        throw Error('Missing Parameters')
    }

    try {
        const instanceId = await getInstanceId({ pipeline, projectId })
        if (!instanceId) {
            await saveProjectDetailsByID(
                projectId,
                'error',
                null,
                'Instance creation failed from AMI'
            )

            throw new Error('Instance creation failed')
        }

        await saveInstanceId(instanceId, projectId)

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
            pipeline,
            app
        })

        const response = runPipelineRequest({
            ipAddress,
            pipeline,
            apiData,
            projectId
        })
        await saveStatus(projectId, 'running', null, null)
        console.log(response)
    } catch (error) {
        await saveStatus(projectId, 'error', null, error.message)
        console.error('Error:', error)
    }
}
