const path = require('path');
const { version } = require('./package.json');
const { withSentryConfig } = require('@sentry/nextjs/config');

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        SVC_BIBLE: process.env.NEXT_PUBLIC_SVC_BIBLE,
        SVC_PASSAGE: process.env.NEXT_PUBLIC_SVC_PASSAGE,
        SVC_USER: process.env.NEXT_PUBLIC_SVC_USER,
        SIGNING_SECRET: process.env.NEXT_PUBLIC_SIGNING_SECRET,
        APP_VERSION: version
    },
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    }
}

module.exports = withSentryConfig(nextConfig, {
    org: 'bible-game',
    project: 'bible-game',

    // Uploads source maps on production builds, so stack traces show the original code
    authToken: process.env.SENTRY_AUTH_TOKEN,
    widenClientFileUpload: true,

    // Sends browser events through the app, so ad-blockers don't drop them
    tunnelRoute: '/monitoring',

    silent: !process.env.CI,
})