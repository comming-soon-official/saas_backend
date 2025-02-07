require('dotenv').config()
// const S3Adapter = require('@parse/s3-files-adapter')
const { ParseServer } = require('parse-server')
const ParseDashboard = require('parse-dashboard')

const parseConfig = new ParseServer({
    databaseURI: process.env.DATABASE_URI,
    cloud: './cloud/another.js',
    // filesAdapter: new S3Adapter(
    //     process.env.S3_ACCESS_KEY,
    //     process.env.S3_SECRET_KEY,
    //     'saasproduct',
    //     {
    //         directAccess: true,
    //         bucketPrefix: 'userfiles/'
    //     }
    // ),
    appId: process.env.APP_ID,
    appName: process.env.APP_NAME,
    masterKey: process.env.MASTER_KEY,
    fileKey: 'optionalFileKey',
    publicServerURL: process.env.SERVER_URL,
    maxUploadSize: '500mb',
    serverURL: process.env.SERVER_URL,
    encodeParseObjectInCloudFunction: true, // Add this line
    fileUpload: {
        enableForPublic: true,
        enableForAnonymousUser: true,
        fileExtensions: ['*']
    }
})

const dashboardConfig = new ParseDashboard({
    apps: [
        {
            serverURL: process.env.SERVER_URL,
            appId: process.env.APP_ID,
            masterKey: process.env.MASTER_KEY,
            appName: process.env.APP_NAME
        }
    ],
    users: [
        {
            user: process.env.DB_USER,
            pass: process.env.DB_PASS
        }
    ],
    allowInsecureHTTP: true,
    useEncryptedPasswords: false
})

module.exports = { parseConfig, dashboardConfig }
