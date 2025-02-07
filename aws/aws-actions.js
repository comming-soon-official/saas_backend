import { saveStatus } from '../cloud/main'
import {
    GPAI_AMI_ID,
    IMAGE_AMI_ID,
    STRUCTURED_AMI_ID
} from '../utility/CONSTANT'

const {
    RunInstancesCommand,
    DescribeInstancesCommand,
    TerminateInstancesCommand
} = require('@aws-sdk/client-ec2')

const ec2 = new EC2Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: '',
        secretAccesskey: ''
    }
})

export const getInstanceId = async ({ pipeline, projectId }) => {
    try {
        switch (pipeline) {
            case 'image':
                return await createNewInstance(
                    IMAGE_AMI_ID,
                    'Saas-Image',
                    'g4dn.xlarge'
                )

            case 'structured':
                return await createNewInstance(
                    STRUCTURED_AMI_ID,
                    'Saas-Structured',
                    'g4dn.xlarge'
                )

            case 'gpai':
                return await createNewInstance(
                    GPAI_AMI_ID,
                    'Saas-Gpai',
                    'g4dn.xlarge'
                )

            default:
                await saveStatus(projectId, 'error', null, 'Invalid Pipeline')
        }
    } catch (error) {
        console.log('Error on getting Instance ID')
        await saveStatus(
            projectId,
            'error',
            null,
            'Error on getting Instance ID'
        )
    }
}

export const createNewInstance = async ({
    amiId,
    instanceName,
    instanceType
}) => {
    const command = new RunInstancesCommand({
        KeyName: 'testaing',
        SecurityGroupIds: ['sg-0aee733a706619fcb'],
        ImageId: amiId,
        InstanceType: instanceType,
        MinCount: 1,
        MaxCount: 1,
        TagSpecifications: [
            {
                ResourceType: 'instance',
                Tags: [{ Key: 'Name', Value: instanceName }]
            }
        ]
    })
    try {
        const response = await ec2.send(command)
        return response.Instances[0].InstanceId
    } catch (error) {
        console.log('Error While Creating Instance', error)
        return error
    }
}

export const checkInstanceStatus = async ({ InstanceId }) => {
    const command = new DescribeInstancesCommand({
        Filters: [{ Name: 'instance-state-name', Values: ['running'] }],
        InstanceIds: [InstanceId]
    })

    try {
        const { Reservations } = await ec2.send(command)
        var instance = Reservations[0]?.Instances[0]
        var data = {
            ipAddress: instance?.PublicIpAddress,
            state: instance?.State.Name
        }
        return data
    } catch (err) {
        throw err
    }
}

export const terminateInstance = async (instanceId) => {
    const command = new TerminateInstancesCommand({
        InstanceIds: [instanceId]
    })

    try {
        const response = await ec2.send(command)
        return response
    } catch (err) {
        return err
    }
}
