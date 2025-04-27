import { Request, Response } from 'express'
import { Server } from 'socket.io'
import redisClient from '../configs/redis.config'
import { SOSRequest } from '../database/models/sos_request'
import { CasesReport } from '../database/models/cases_report'
export class SOSController {
    constructor(private io: Server) {}

    async sendSOS(req: Request, res: Response) {
        try {
            const { userId, location } = req.body

            if (!userId) {
                return res.status(400).send({
                    status: 'ERROR',
                    message: 'userId is required'
                })
            }

            if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
                return res.status(400).send({
                    status: 'ERROR',
                    message: 'Valid location with lat and lng is required'
                })
            }

            const previousSOS = await SOSRequest.findOne({
                where: { user_id: userId },
                order: [['created_at', 'DESC']] //find the most recent SOS request
            })

            let caseId: number | null = null

            if (previousSOS) {
                if (previousSOS.dataValues.status === 'expired' || previousSOS.dataValues.status === 'cancelled') {
                    console.log('Previous SOS is expired or cancelled. Creating a new case.')
                } else if (previousSOS.dataValues.case_id) {
                    // if the previous SOS has a case_id, check if the case is open
                    const existingCase = await CasesReport.findOne({
                        where: { id: previousSOS.dataValues.case_id, status: 'open' }
                    })

                    if (existingCase) {
                        caseId = existingCase.dataValues.id

                        // update the sos_list in the existing case
                        const currentSOSList = existingCase.dataValues.sos_list || []
                        const updatedSOSList = Array.from(new Set([...currentSOSList, previousSOS.dataValues.id]))
                        await existingCase.update({ sos_list: updatedSOSList })
                    } else {
                        console.log('No open case found for previous SOS. Creating a new case.')
                    }
                }
            }

            if (!caseId) {
                const newCase = await CasesReport.create({
                    status: 'open',
                    sos_list: []
                })
                caseId = newCase.dataValues.id
            }

            const sosRequest = await SOSRequest.create({
                user_id: userId,
                latitude: location.lat,
                longitude: location.lng,
                status: 'pending',
                case_id: caseId
            })

            const caseToUpdate = await CasesReport.findOne({ where: { id: caseId } })
            if (caseToUpdate) {
                const currentSOSList = caseToUpdate.dataValues.sos_list || []
                const updatedSOSList = Array.from(new Set([...currentSOSList, sosRequest.dataValues.id]))
                await caseToUpdate.update({ sos_list: updatedSOSList })
            }

            const keys = await redisClient.keys('account:*') // get all keys in Redis that start with 'account:'
            let notifiedTeams = 0
            const notifiedTeamIds: number[] = []

            for (const key of keys) {
                const accountData = await redisClient.get(key)
                if (accountData) {
                    const { socket_id: socketId, role, user_id: teamId } = JSON.parse(accountData)

                    // Check if the role is 'rescue_team' and the teamId is not the same as the userId
                    if (role === 'rescue_team') {
                        this.io.to(socketId).emit('receiveSOS', {
                            sosId: sosRequest.id,
                            userId,
                            location,
                            type: 'RESCUE_TEAM_NOTIFICATION'
                        })
                        console.log(`SOS sent to rescue team (key: ${key}, socket ID: ${socketId})`)
                        notifiedTeams++
                        notifiedTeamIds.push(teamId)
                    }
                }
            }

            console.log(`Notified ${notifiedTeams} rescue teams`)
            await sosRequest.update({ nearest_team_ids: notifiedTeamIds })
            console.log(`SOS from ${userId} at location:`, location)
            return res.status(201).send({
                status: 'SUCCESS',
                message: 'SOS sent successfully',
                data: sosRequest
            })
        } catch (error) {
            console.error('Error sending SOS:', error)
            return res.status(500).send({
                status: 'ERROR',
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }
}
