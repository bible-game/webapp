const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        SVC_PASSAGE: process.env.NEXT_PUBLIC_SVC_PASSAGE
    },
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    }
}

module.exports = nextConfig