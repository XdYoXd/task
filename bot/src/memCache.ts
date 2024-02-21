import memoryCache, { CacheClass } from "memory-cache";

class MemCache {
    // keyName_userId , value 
    private memCache: CacheClass<string, string>;

    constructor() {
        this.memCache = new memoryCache.Cache();
    }

    public put(key: string, value: string, id: number | undefined): void {
        this.memCache.put(key + "_" + id, value);
    }
    public get(key: string, id: number | undefined): string | null {
        return this.memCache.get(key + "_" + id);
    }
};

export default MemCache;