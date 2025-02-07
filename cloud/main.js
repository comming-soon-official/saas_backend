require('./payments.js')
const axios = require('axios')
const EventSource = require('eventsource')

export const Project = Parse.Object.extend('Project')
export const projectQuery = new Parse.Query(Project)

const { runPipeline, terminateInstance } = require('../aws.service')

const saveProjectDetailsByID = async (projectId, status, result, reason) => {
    projectQuery.equalTo('objectId', projectId)

    try {
        const selectedProject = await projectQuery.first()
        selectedProject.set('status', status)
        if (reason) {
            selectedProject.set('reason', reason)
        }
        if (result) {
            selectedProject.set('result', result)
        }
        return await selectedProject.save()
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}

export const saveStatus = async (projectId, status, results, reason) => {
    if (!projectId) {
        console.log('Missing id while saving status')
    }
    try {
        await saveProjectDetailsByID(projectId, status, results, reason)
        console.log(
            `Project updated successfully with ${(projectId, status, results)}`
        )
    } catch (error) {
        console.log('Error on Saving Project:', error)
    }
}

export const saveInstanceId = async (instanceId, projectId) => {
    projectQuery.equalTo('objectId', projectId)
    try {
        const result = await projectQuery.first()
        if (instanceId) {
            result.set('instanceId', instanceId)
            await result.save()
        } else {
            console.log('Project not found.')
        }
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}

export const terminateInstanceById = async (projectId) => {
    try {
        if (!projectId) {
            console.log('projectId is Missing For Termination')
            return
        }
        const project = Parse.Object.extend('Project')
        const query = new Parse.Query(project)
        query.equalTo('objectId', projectId)
        var results = await query.find()
        var instanceId = results[0].get('instanceId')

        await terminateInstance(instanceId)
        await saveProjectDetailsByID(
            projectId,
            'cancelled',
            null,
            'project has been cancelled by the user'
        )
        return true
    } catch (error) {
        return error
    }
}

Parse.Cloud.define('save-status', async (request) => {
    const { projectId, status, results, reason } = request.params
    return await saveStatus(projectId, status, results, reason)
})

Parse.Cloud.define('save-instance-id', async (request) => {
    const { instanceId, projectId } = request.params
    return await saveInstanceId(instanceId, projectId)
})

Parse.Cloud.define('terminate-instance', async (request) => {
    const { projectId } = request.params
    return await terminateInstanceById(projectId)
})

Parse.Cloud.define('run-pipeline', async (request) => {
    return runPipeline(request).then((result) => result)
})
