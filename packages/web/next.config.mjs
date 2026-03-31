import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  typedRoutes: false,
  turbopack: {
    root: path.resolve(__dirname, '..', '..'),
  },
};

export default nextConfig;
