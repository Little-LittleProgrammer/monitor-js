import { isNullOrUnDef, isWindow, isWx } from './is';
import { decode, encode } from './tools';

interface IStorageParams {
    prefixKey: string;
    storage: Storage | WechatMiniprogram.Wx;
    timeout?: number | null;
    hasEncrypt: boolean
}

type Options = Partial<IStorageParams>;

export const createStorage = ({
    prefixKey = '',
    storage = localStorage,
    timeout = null,
    hasEncrypt = false
}: Options) => {
    const WebStorage = class WebStorage {
        storage: Storage | WechatMiniprogram.Wx;
        hasEncrypt: boolean;
        prefixKey?: string;

        constructor() {
            this.storage = storage;
            this.prefixKey = prefixKey;
            this.hasEncrypt = hasEncrypt;
        }

        getKey(key: string) {
            return `${this.prefixKey}_${key}`.toUpperCase();
        }

        set(key: string, value: any, expire: number | null = timeout) {
            const _stringData = JSON.stringify({
                value,
                time: Date.now(),
                expire: !isNullOrUnDef(expire) ? new Date().getTime() + expire * 1000 : null
            });
            const _storageData = this.hasEncrypt ? encode(_stringData) : _stringData;
            if (isWindow) {
                (this.storage as Storage).setItem(this.getKey(key), _storageData);
            } else if (isWx) {
                (this.storage as WechatMiniprogram.Wx).setStorageSync(this.getKey(key), _storageData);
            }
        }

        get(key: string): any {
            let _val = '';
            if (isWindow) {
                _val = (this.storage as Storage).getItem(this.getKey(key));
            } else if (isWx) {
                _val = (this.storage as WechatMiniprogram.Wx).getStorageSync(this.getKey(key));
            }
            if (!_val) return null;
            try {
                const decVal = this.hasEncrypt ? decode(_val) : _val;

                const data = JSON.parse(decVal);
                const { value, expire } = data;
                if (isNullOrUnDef(expire) || expire >= new Date().getTime()) {
                    return value;
                }
                this.remove(key);
            } catch (e) {
                return null;
            }
        }

        remove(key: string) {
            if (isWindow) {
                (this.storage as Storage).removeItem(this.getKey(key));
            } else if (isWx) {
                (this.storage as WechatMiniprogram.Wx).removeStorageSync(this.getKey(key));
            }
        }

        clear(): void {
            if (isWindow) {
                (this.storage as Storage).clear();
            } else if (isWx) {
                (this.storage as WechatMiniprogram.Wx).clearStorageSync();
            }
        }
    };
    return new WebStorage();
};

const createOptions = (storage: Storage | WechatMiniprogram.Wx, options: Options = {}): Options => {
    return {
        // No encryption in debug mode
        hasEncrypt: false,
        storage,
        prefixKey: '',
        timeout: 60 * 60 * 24 * 7,
        ...options
    };
};

export const createSessionStorage = (options: Options = {}) => {
    return createStorage(createOptions(sessionStorage, { ...options, prefixKey: 'session'}));
};

export const createLocalStorage = (options: Options = {}) => {
    return createStorage(createOptions(localStorage, { ...options, prefixKey: 'local'}));
};

export const createWxStorage = (options: Options = {}) => {
    return createStorage(createOptions(wx, { ...options, prefixKey: 'wx'}));
};
