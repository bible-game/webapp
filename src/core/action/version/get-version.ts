"use server"

const { version } = require('../../../../package.json')

let appVersion: string

export default async function getVersion() {
    if (!appVersion) {
        appVersion = version
    }
    return appVersion
}
