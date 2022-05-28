import Store from 'jstor';
import StrategyRedis from './jstor-redis.js';

export const store = new Store({
    strategy: StrategyRedis({
        url: 'redis://127.0.0.1:6379',
        keyPrefix: 'jstor'
    })
});