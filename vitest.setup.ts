import { beforeAll, afterEach } from 'vitest';

// ResizeObserver のモックを設定
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

// localStorage のモックを設定
beforeAll(() => {
  class LocalStorageMock implements Storage {
    private store: Record<string, string> = {};

    getItem(key: string): string | null {
      return this.store[key] || null;
    }

    setItem(key: string, value: string): void {
      this.store[key] = value.toString();
    }

    removeItem(key: string): void {
      delete this.store[key];
    }

    clear(): void {
      this.store = {};
    }

    get length(): number {
      return Object.keys(this.store).length;
    }

    key(index: number): string | null {
      const keys = Object.keys(this.store);
      return keys[index] || null;
    }

    // Object.keys(localStorage) をサポートするために必要
    [Symbol.iterator]() {
      return Object.keys(this.store)[Symbol.iterator]();
    }

    // Object.keys をサポート
    keys() {
      return Object.keys(this.store);
    }
  }

  const localStorageMock = new LocalStorageMock();

  // localStorage のプロキシを作成して Object.keys をサポート
  const localStorageProxy = new Proxy(localStorageMock, {
    ownKeys(target: any) {
      return target.keys();
    },
    getOwnPropertyDescriptor(target: any, prop: string) {
      if (target.getItem(prop) !== null) {
        return {
          enumerable: true,
          configurable: true,
          value: target.getItem(prop),
        };
      }
      return Object.getOwnPropertyDescriptor(target, prop);
    },
  });

  Object.defineProperty(global, 'localStorage', {
    value: localStorageProxy,
    writable: true,
    configurable: true,
  });
});

// 各テスト後に localStorage をクリア
afterEach(() => {
  localStorage.clear();
});
