interface AppConfig {
  api: {
    baseURL: string;
    timeout: number;
    prefix: string;
  };
  app: {
    title: string;
    env: string;
    isDev: boolean;
    isProd: boolean;
  };
  token: {
    key: string;
    refreshKey: string;
  };
  upload: {
    url: string;
  };
  websocket: {
    url: string;
  };
}

/**
 * 环境变量配置
 */
export const config: AppConfig = {
  // API配置
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
    prefix: import.meta.env.VITE_API_PREFIX || '/api/v1',
  },

  // 应用配置
  app: {
    title: import.meta.env.VITE_APP_TITLE || '灵简平台',
    env: import.meta.env.MODE || 'development',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
  },

  // Token配置
  token: {
    key: import.meta.env.VITE_TOKEN_KEY || 'lingjian_token',
    refreshKey: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'lingjian_refresh_token',
  },

  // 上传配置
  upload: {
    url: import.meta.env.VITE_UPLOAD_URL || 'http://localhost:8080/api/v1/upload',
  },

  // WebSocket配置
  websocket: {
    url: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080/ws',
  },
};

/**
 * 获取配置值
 * @param section 配置区块
 * @param key 配置键
 * @returns 配置值
 */
export function getConfig<
  S extends keyof AppConfig,
  K extends keyof AppConfig[S]
>(section: S, key: K): AppConfig[S][K] {
  return config[section][key];
}

/**
 * 获取环境变量
 * @param key 环境变量key
 * @param defaultValue 默认值
 * @returns 环境变量值
 */
export function getEnvVar(key: keyof ImportMetaEnv, defaultValue = ''): string {
  return import.meta.env[key] || defaultValue;
}

/**
 * 是否是开发环境
 */
export const isDev = import.meta.env.DEV;

/**
 * 是否是生产环境
 */
export const isProd = import.meta.env.PROD;

export default config;
