const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        SVC_PASSAGE: 'https://passage-oa8a.onrender.com' // 'http://localhost:8081' // 'https://passage-oa8a.onrender.com'
        // TODO :: explore proper environment handling
    },
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    }
}

module.exports = nextConfig