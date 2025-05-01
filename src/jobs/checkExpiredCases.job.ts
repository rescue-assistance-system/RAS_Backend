import cron from 'node-cron'
import { Op } from 'sequelize'
import CasesReport from '~/database/models/case_report.model'
import SosRequest from '~/database/models/sos.model'
import { CaseStatus } from '~/enums/case-status.enum'

const ONE_HOUR_MS = 60 * 60 * 1000 // 1 hour
const ONE_DAY_MS = 24 * 60 * 60 * 1000

// Cron job run every minute
cron.schedule('* * * * *', async () => {
    console.log('Running cron job to check expired cases...')

    try {
        // Get all of status "pending"
        const pendingCases = await CasesReport.findAll({
            where: {
                status: CaseStatus.PENDING,
                created_at: {
                    [Op.lt]: new Date(Date.now() - ONE_HOUR_MS), // Filter cases older than 1 hour
                    [Op.gte]: new Date(Date.now() - ONE_DAY_MS)
                }
            }
        })
        console.log(`Found ${pendingCases.length} pending cases older than 1 hour and in a day.`)

        for (const caseItem of pendingCases) {
            const sosList = caseItem.sos_list || []
            if (sosList.length === 0) {
                continue
            }

            // Get the last SOS ID from the list
            const lastSosId = Math.max(...sosList)
            const lastSos = await SosRequest.findOne({
                where: { id: lastSosId }
            })

            if (lastSos && lastSos.created_at) {
                const createdAt = new Date(lastSos.created_at).getTime() + 7 * 60 * 60 * 1000 // Change to UTC+7 (Vietnam timezone)
                console.log(`Last SOS created at: `, new Date(createdAt).toISOString())
                console.log(`Current time: ${new Date(Date.now()).toISOString()}`)
                const currentTime = Date.now()
                const timeDiff = currentTime - createdAt
                console.log(`Time difference in hours: ${timeDiff / (1000 * 60 * 60)} hours`)

                if (timeDiff > ONE_HOUR_MS) {
                    await caseItem.update({ status: CaseStatus.CANCELLED, cancelled_at: new Date() })
                    console.log(`Case with ID ${caseItem.id} has been marked as cancelled.`)
                }
            } else {
                console.error(`Invalid last SOS or created_at for case ID ${caseItem.id}`)
            }
        }
    } catch (error) {
        console.error('Error running cron job:', error)
    }
})
