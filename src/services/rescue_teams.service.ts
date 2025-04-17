import User from '../database/models/user.model'
import bcrypt from 'bcrypt'
import { Op } from 'sequelize'
import RescueTeam from '~/database/models/rescue_team.model'
class RescueTeamService {
    async createRescueTeam(data: { username: string; email: string; password: string }) {
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email: data.email }]
            }
        })

        if (existingUser) {
            throw new Error('Account with this email already exists')
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)
        const rescue_team = await User.create({
            username: data.username,
            email: data.email,
            password: hashedPassword,
            role: 'rescue_team'
        })

        return rescue_team
    }
    async createRescueTeamProfile(
        userId: number,
        data: {
            team_name: string
            team_members: any[]
            default_latitude: number
            default_longitude: number
            description: string
        }
    ) {
        const user = await User.findByPk(userId)
        if (!user || user.role !== 'rescue_team') {
            throw new Error('User is not a rescue team')
        }

        const existingProfile = await RescueTeam.findOne({
            where: { user_id: userId }
        })

        if (existingProfile) {
            throw new Error('Profile already exists for this rescue team')
        }
        const profileData = {
            user_id: userId,
            team_name: data.team_name,
            team_members: data.team_members,
            default_latitude: data.default_latitude,
            default_longitude: data.default_longitude,
            description: data.description
        }

        const profile = await RescueTeam.create(profileData)

        return profile
    }

    async getRescueTeamProfile(userId: number) {
        const profile = await RescueTeam.findOne({
            where: { user_id: userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password'] }
                }
            ]
        })

        if (!profile) {
            throw new Error('Profile not found for this rescue team')
        }

        return profile
    }

    async updateRescueTeamProfile(
        userId: number,
        data: {
            team_name?: string
            team_members?: string
            default_latitude?: number
            default_longitude?: number
            description?: string
        }
    ) {
        const profile = await RescueTeam.findOne({
            where: { user_id: userId }
        })

        if (!profile) {
            throw new Error('Profile not found for this rescue team')
        }

        await profile.update(data)
        return profile
    }

    async updateTeamInfo(
        userId: number,
        data: {
            team_name?: string
            team_members?: string
            default_latitude?: number
            default_longitude?: number
            description?: string
        }
    ) {
        const profile = await RescueTeam.findOne({
            where: { user_id: userId }
        })

        if (!profile) {
            throw new Error('Profile not found for this rescue team')
        }

        await profile.update(data)
        return profile
    }

    async getRescueTeams() {
        return await User.findAll({ where: { role: 'rescue_team' } }) //, attributes: { exclude: ['password'] }
    }

    async getRescueTeamById(id: number) {
        const rescue_team = await User.findOne({
            attributes: { exclude: ['password'] },
            where: { id: id, role: 'rescue_team' }
        })
        if (!rescue_team) {
            throw new Error('Rescue team not found')
        }
        return rescue_team
    }

    async updateRescueTeam(id: number, data: { username?: string; email?: string; password?: string }) {
        const rescue_team = await User.findOne({
            attributes: { exclude: ['password'] },
            where: { id: id, role: 'rescue_team' }
        })

        if (!rescue_team) {
            throw new Error('Rescue team not found')
        }
        const hashedPassword = await bcrypt.hash(data.password, 10)
        await rescue_team.update({ ...data, password: hashedPassword })
        return rescue_team
    }

    async deleteRescueTeam(id: string) {
        const rescue_team = await User.findOne({
            attributes: { exclude: ['password'] },
            where: { id: id, role: 'rescue_team' }
        })
        if (!rescue_team) {
            throw new Error('Rescue team not found')
        }

        await rescue_team.destroy()
        return { message: 'Rescue team deleted successfully' }
    }
    async getRescueTeamProfileById(id: number) {
        const rescueTeamAccount = await User.findOne({
            where: { id: id, role: 'rescue_team' }
        })
        const rescueTeamProfile = await RescueTeam.findOne({
            where: { user_id: id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password'] }
                }
            ]
        })
        if (!rescueTeamProfile) {
            throw new Error('Rescue team profile not found')
        }

        return {
            account_info: {
                id: rescueTeamAccount?.dataValues.id,
                username: rescueTeamAccount?.dataValues.username,
                email: rescueTeamAccount?.dataValues.email,
                // phone: rescueTeamAccount?.dataValues.phone,
                role: rescueTeamAccount?.dataValues.role
            },
            rescue_team_info: {
                id: rescueTeamProfile.id,
                team_name: rescueTeamProfile.team_name,
                team_members: rescueTeamProfile.team_members,
                description: rescueTeamProfile.description,
                is_active: rescueTeamProfile.is_active,
                default_location: {
                    latitude: rescueTeamProfile.default_latitude,
                    longitude: rescueTeamProfile.default_longitude
                }
            }
        }
    }
}

export default new RescueTeamService()
