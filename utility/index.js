import { saveStatus } from '../cloud/main'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const waitForInstanceRunning = async (instanceId) => {
    console.log('Checking if instance is running...')
    let count = 0
    while (count < 20) {
        count++
        const data = await checkInstanceStatus(instanceId)
        if (data.state === 'running' && data.ipAddress) {
            return data
        }
        await delay(3000)
    }
}

export const waitForApiReachability = async ({ ipAddress }) => {
    let apiReachable = false
    while (!apiReachable) {
        try {
            console.log('Checking if API is reachable...')
            const res = await axios.get(`http://${ipAddress}/healthcheck`)
            if (res.data === 'passed') {
                console.log('API is reachable')
                apiReachable = true
            }
        } catch {
            console.log('API not reachable yet. Retrying in 2 seconds...')
            await delay(2000)
        }
    }
}

export const buildApiData = ({
    dataset,
    model,
    projectId,
    userId,
    instanceId,
    ipAddress,
    colInput,
    pipeline,
    app
}) => {
    console.log('Building API data...')
    const baseData = {
        dataset,
        model,
        projectId,
        userId,
        instanceId,
        ipAddress,
        pipeline,
        app
    }
    const additionalProperties = {}
    if (colInput) {
        if (pipeline == 'structured' || pipeline == 'gpai') {
            additionalProperties.colInput = colInput
        }
    }
    return { ...baseData, ...additionalProperties }
}

export const runPipelineRequest = async ({
    ipAddress,
    pipeline,
    apiData,
    projectId
}) => {
    console.log('Running pipeline request...')
    console.log('apiData', apiData)

    switch (pipeline) {
        case 'image':
            return axios.post(`http://${ipAddress}/saas/run`, apiData)

        case 'structured':
            return axios.post(`http://${ipAddress}/saas/run`, apiData)

        case 'gpai':
            return axios.post(`http://${ipAddress}/gpai/run`, apiData)

        default:
            return await saveStatus(
                projectId,
                'error',
                null,
                'Invalid Pipeline'
            )
    }
}
