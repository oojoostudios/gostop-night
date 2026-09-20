import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Allow dev-server requests from this machine's LAN IP, so the site can be
  // opened on a phone on the same wifi. Update if the IP changes.
  allowedDevOrigins: ['10.0.0.16'],
};

export default nextConfig;
