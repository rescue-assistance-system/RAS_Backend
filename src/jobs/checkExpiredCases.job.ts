import cron from 'node-cron'
import { Op } from 'sequelize'
import CasesReport from '~/database/models/case_report.model'
import SosRequest from '~/database/models/sos.model'
import { CaseStatus } from '../enums/case-status.enum'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { SosService } from '~/services/sos.service'
import { User } from '~/database'
import { Role } from '~/enums/Role'

dayjs.extend(utc)
dayjs.extend(timezone)

const ONE_HOUR_MS = 60 * 60 * 1000 // 1 hour
const ONE_DAY_MS = 24 * 60 * 60 * 1000

// Cron job run every minute
cron.schedule('* * * * *', async () => {
    console.log('Running cron job to check expired cases...')

    try {
        // Get list of case PENDING > 1 hour < 1 day
        const pendingCases = await CasesReport.findAll({
            where: {
                status: CaseStatus.PENDING,
                created_at: {
                    // [Op.lte]: new Date(Date.now() - 10 * 60 * 1000), // Case older than 1 hour
                    [Op.gte]: new Date(Date.now() - ONE_DAY_MS) // Case within 1 day
                }
            }
        })
        console.log(`Pending cases older than 10 minutes and within a day: ${pendingCases.length}`)
        console.log(`New Date: ${new Date()}`)
        console.log(`Found ${pendingCases.length} pending cases older than 1 hour and within a day.`)

        for (const caseItem of pendingCases) {
            await processCase(caseItem)
        }
    } catch (error) {
        console.error('Error running cron job:', error)
    }
})

// Function to process each case
async function processCase(caseItem: any): Promise<void> {
    try {
        const sosList = caseItem.sos_list || []
        if (sosList.length === 0) {
            console.log(`Case ID ${caseItem.id} has no SOS requests. Skipping...`)
            return
        }

        // Get the last SOS request from the list
        const lastSosId = Math.max(...sosList)
        const lastSos = await SosRequest.findOne({
            where: { id: lastSosId }
        })

        if (lastSos && lastSos.created_at) {
            const createdAt = dayjs(lastSos.created_at)
            const currentTime = dayjs().tz('Asia/Ho_Chi_Minh')
            const timeDiffMinutes = currentTime.diff(createdAt, 'minute')
            const timeDiffHours = currentTime.diff(createdAt, 'hour')

            console.log(`Last SOS created at: ${createdAt.format()}`)
            console.log(`Time difference: ${timeDiffMinutes} minutes (${timeDiffHours} hours)`)
            console.log(`Case ID: ${caseItem.id}`)
            if (timeDiffMinutes >= 10 && timeDiffHours < 1) {
                // Send notification to Coordinator
                await notifyCoordinator(caseItem.id)
            }
            if (timeDiffHours >= 1) {
                //Update case status to CANCELLED
                await caseItem.update({ status: CaseStatus.EXPIRED, cancelled_at: new Date() })
                console.log(`Case with ID ${caseItem.id} has been marked as cancelled.`)
            }
        } else {
            console.error(`Invalid last SOS or created_at for case ID ${caseItem.id}`)
        }
    } catch (error) {
        console.error(`Error processing case ID ${caseItem.id}:`, error)
    }
}

// Function to notify Coordinators about the cancelled case
async function notifyCoordinator(caseId: number): Promise<void> {
    try {
        const sosService = new SosService()
        const coordinators = await getCoordinators()

        if (coordinators.length === 0) {
            console.log(`No coordinators found for case ID ${caseId}.`)
            return
        }

        console.log(`Coordinators: ${coordinators.join(', ')}`)

        const notification = {
            type: 'case_cancelled',
            message: `Case ${caseId} has been cancelled due to expiration.`
        }

        await sosService.sendNotificationToUser(coordinators, notification)
        console.log(`Notified Coordinators about cancelled case ${caseId}.`)
    } catch (error) {
        console.error(`Error notifying Coordinators for case ID ${caseId}:`, error)
    }
}
// Function to get list of Coordinators
async function getCoordinators(): Promise<number[]> {
    const coordinators = await User.findAll({
        where: { role: Role.COORDINATOR },
        attributes: ['id'],
        raw: true
    })

    console.log(`Raw coordinators data: ${JSON.stringify(coordinators)}`)

    const coordinatorIds = coordinators
        .map((coordinator) => coordinator.id)
        .filter((id): id is number => id !== null && id !== undefined)

    console.log(`Found ${coordinatorIds.length} coordinators.`)
    console.log(`Coordinator IDs: ${coordinatorIds.join(', ')}`)
    return coordinatorIds
}
