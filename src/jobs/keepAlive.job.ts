import cron from 'node-cron'
import axios from 'axios'
import config from '../configs/config'

cron.schedule('*/3 * * * *', async () => {
    try {
        const response = await axios.get(`${config.APP_URL}/api/health`)
        console.log('Keep-alive ping successful:', response.data)
    } catch (error) {
        console.error('Keep-alive ping failed:', error.message)
    }
})
