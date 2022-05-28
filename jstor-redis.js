import { createClient } from "redis";

export default function(options = {}){

    //ensure table name!
    if(!options.url) options.url = process.env.REDIS_URL;
    if(!options.url) throw new Error(`jstor redis: A redis url is required to use the redis strategy`);

    const redisClient = createClient({
        url: options.url
    });

    return function(store){

        const defaultStoreOptions = {
            cacheOptions: {
                files: {
                    maxAge: false //no caching of redis documents
                },
                keys: {
                    maxAge: (15 * 60) //only update the keys every 15 minutes
                }
            }
        };
        store.setOptions(Object.assign(defaultStoreOptions, options));

        function getKey(key){
            return `${options.keyPrefix || ''}${key}`;
        }

        let redisConnectionState;
        async function connectedToRedis(){
            return redisConnectionState || (redisConnectionState = redisClient.connect());
        }

        return {

            async get(key){
                await connectedToRedis();
                const data = await redisClient.get(getKey(key));
                return JSON.parse(data);
            },

            async save(key, document){
                await connectedToRedis();
                return redisClient.SET(getKey(key), JSON.stringify(document));
            },

            async remove(key){
                await connectedToRedis();
                return redisClient.DEL(getKey(key));
            },

            async keys(){
                await connectedToRedis();
                const keys = await redisClient.KEYS(`${options.keyPrefix || ''}*`);
                return options.keyPrefix && Array.isArray(keys) ?
                    keys.map(key => key.replace(options.keyPrefix, '')):
                    keys;
            }

        };

    }

}