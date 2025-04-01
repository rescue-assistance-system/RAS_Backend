import redisClient from '../configs/redis.config'

const OTP_EXPIRY = 300 

export const debugRedisKeys = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect()
        }

        const keys = await redisClient.keys('*')
        console.log('All Redis keys:', keys)

        for (const key of keys) {
            const value = await redisClient.get(key)
            console.log(`Key: ${key}`)
            console.log(`Value: ${value}`)
            console.log('TTL:', await redisClient.ttl(key))
            console.log('-------------------')
        }
    } catch (error) {
        console.error('Error debugging Redis:', error)
    }
}

export const generateOTP = (): string => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('Generated OTP:', otp)
    return otp
}

export const storeOTP = async (email: string, otp: string): Promise<void> => {
    try {
        if (!redisClient.isOpen) {
            console.log('Connecting to Redis...');
            await redisClient.connect();
        }

        const key = `otp:${email}`;
        const existingOTP = await redisClient.get(key);

        if (existingOTP) {
            console.log(`OTP already exists for ${email}. Skipping email.`);
            return;
        }

        console.log('Storing OTP in Redis with key:', key);

        await redisClient.set(key, otp, { EX: OTP_EXPIRY });

        console.log('Stored OTP in Redis:', otp);
    } catch (error) {
        console.error('Error in storeOTP:', error);
        throw error;
    }
};
export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
        if (!redisClient.isOpen) {
            console.log('Connecting to Redis...')
            await redisClient.connect()
        }

        const key = `otp:${email}`
        const storedOTP = await redisClient.get(key)
        console.log('Verifying OTP:', { provided: otp, stored: storedOTP })

        return storedOTP === otp
    } catch (error) {
        console.error('Error in verifyOTP:', error)
        throw error
    }
}

export const clearOTP = async (email: string): Promise<void> => {
    try {
        if (!redisClient.isOpen) {
            console.log('Connecting to Redis...')
            await redisClient.connect()
        }

        const key = `otp:${email}`
        await redisClient.del(key)
        console.log('Cleared OTP for:', email)
    } catch (error) {
        console.error('Error in clearOTP:', error)
        throw error
    }
}

export const getOTPExpiry = (): number => {
    return OTP_EXPIRY
}
