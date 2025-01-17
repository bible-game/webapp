const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        passageService: 'https://passage-oa8a.onrender.com' // 'http://localhost:8081',
    },
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    }
}

module.exports = nextConfig