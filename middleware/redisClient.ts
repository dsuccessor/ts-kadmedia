import redis from 'redis';

export const redisClient = async ()=>{
 const redisClient = redis.createClient()
 .on('error', (err)=>console.log({message: 'Failed to connect to Redis', error: err, status: 'failed'}));

 await redisClient.connect();

 return redisClient
}