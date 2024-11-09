interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<string>;
  removeItem(key: string): Promise<void>;
}

// 创建一个自定义存储适配器，用于处理服务器端渲染
const createNoopStorage = (): Storage => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

// 创建一个localStorage的Promise包装器
const createLocalStorage = (): Storage => {
  return {
    getItem(key: string) {
      return Promise.resolve(localStorage.getItem(key));
    },
    setItem(key: string, value: string) {
      localStorage.setItem(key, value);
      return Promise.resolve(value);
    },
    removeItem(key: string) {
      localStorage.removeItem(key);
      return Promise.resolve();
    },
  };
};

const storage = typeof window !== 'undefined' 
  ? createLocalStorage()
  : createNoopStorage();

export default storage;
