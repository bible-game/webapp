const path = require('path');
const { version } = require('./package.json');

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

module.exports = nextConfig