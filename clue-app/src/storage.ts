// LocalStorage-based storage polyfill to replace window.storage API
interface StorageAPI {
    get: (key: string, shared?: boolean) => Promise<{ value: string } | null>;
    set: (key: string, value: string, shared?: boolean) => Promise<void>;
    delete: (key: string, shared?: boolean) => Promise<void>;
    list: (prefix: string) => Promise<{ keys: string[] } | null>;
}

const storage: StorageAPI = {
    get: async (key: string, _shared?: boolean) => {
        const value = localStorage.getItem(key);
        if (value === null) return null;
        return { value };
    },

    set: async (key: string, value: string, _shared?: boolean) => {
        localStorage.setItem(key, value);
    },

    delete: async (key: string, _shared?: boolean) => {
        localStorage.removeItem(key);
    },

    list: async (prefix: string) => {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keys.push(key);
            }
        }
        return { keys };
    }
};

// Augment the Window interface
declare global {
    interface Window {
        storage: StorageAPI;
        jsQR: any;
        QRCode: any;
    }
}

// Assign to window
window.storage = storage;

export default storage;
