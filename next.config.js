const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        SVC_BIBLE: process.env.NEXT_PUBLIC_SVC_BIBLE,
        SVC_PASSAGE: process.env.NEXT_PUBLIC_SVC_PASSAGE,
        SVC_USER: process.env.NEXT_PUBLIC_SVC_USER,
        SIGNING_SECRET: process.env.NEXT_PUBLIC_SIGNING_SECRET
    },
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    },
    transpilePackages: ["@project-skymap/library"]
}

module.exports = nextConfig