const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        passageService: 'http://localhost:8081' // 'http://localhost:8081', // 'https://passage-oa8a.onrender.com'
    },
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    }
}

module.exports = nextConfig