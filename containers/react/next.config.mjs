/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.intra.42.fr',
                port: '',
                pathname: '/users/**',
            },
            ]
    }
};

export default nextConfig;
