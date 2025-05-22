import User from '../database/models/user.model'
import bcrypt from 'bcrypt'
import { Op } from 'sequelize'
import RescueTeam from '~/database/models/rescue_team.model'
import { formatPaginatedData, getPagination } from '~/utils/pagination'
class RescueTeamService {
    async createRescueTeam(data: { username: string; email: string; password: string; phone: string }) {
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
            role: 'rescue_team',
            phone: data.phone
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
        console.log(user)
        console.log(user?.dataValues.role)
        if (!user || user.dataValues.role !== 'rescue_team') {
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

    async updateRescueTeam(id: number, data: { username?: string; email?: string; password?: string; phone?: string }) {
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
        // get account info
        const rescueTeamAccount = await User.findOne({
            where: { id: id, role: 'rescue_team' }
        })

        // find account info
        if (!rescueTeamAccount) {
            throw new Error('Rescue team account not found')
        }

        // find profile info
        const rescueTeamProfile = await RescueTeam.findOne({
            where: { user_id: id },
            include: [
                {
                    model: User,
                    as: 'user'
                }
            ]
        })

        return {
            account_info: {
                id: rescueTeamAccount.dataValues.id,
                username: rescueTeamAccount.dataValues.username,
                email: rescueTeamAccount.dataValues.email,
                password: rescueTeamAccount.dataValues.password,
                createdAt: rescueTeamAccount.dataValues.createdAt,
                phone: rescueTeamAccount.dataValues.phone,
                role: rescueTeamAccount.dataValues.role,
                deviceId: rescueTeamAccount.dataValues.device_id
            },
            rescue_team_info: rescueTeamProfile
                ? {
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
                : null,
            profile_status: rescueTeamProfile ? 'complete' : 'pending'
        }
    }
    async getPaginatedRescueTeams(page: number, limit: number, search: string) {
        const { offset, limit: safeLimit, page: safePage } = getPagination(page, limit)

        const where = {
            role: 'rescue_team',
            ...(search && {
                [Op.or]: [
                    { username: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } },
                    { phone: { [Op.iLike]: `%${search}%` } }
                ]
            })
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            offset,
            limit: safeLimit,
            order: [['created_at', 'DESC']]
        })

        return formatPaginatedData(count, rows, safePage, safeLimit)
    }

    async getRescueTeamMembers(userId: string): Promise<any[]> {
        try {
            const rescueTeam = await RescueTeam.findOne({
                where: { user_id: userId },
                attributes: ['team_members', 'team_name']
            })

            if (!rescueTeam) {
                throw new Error(`Rescue team with account ID ${userId} not found.`)
            }

            const teamMembers = rescueTeam.getDataValue('team_members') || []
            return teamMembers.map((member: any) => ({
                id: member.id,
                name: member.name,
                role: member.role,
                contact: member.contact
            }))
        } catch (error: any) {
            console.error('Error fetching rescue team members:', error)
            throw new Error(`Failed to fetch rescue team members: ${error.message}`)
        }
    }

    public async getAllRescueTeams(): Promise<any[]> {
        try {
            const rescueTeams = await RescueTeam.findAll({
                attributes: ['id', 'user_id', 'team_name', 'description', 'status'],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['phone', 'email']
                    }
                ]
            })

            console.log('Rescue Teams', rescueTeams)
            return rescueTeams.map((team: any) => ({
                id: team.id,
                user_id: team.user_id,
                team_name: team.team_name,
                description: team.description,
                status: team.status,
                phone: team.user?.phone || null,
                email: team.user?.email || null
            }))
        } catch (error: any) {
            console.error('Error fetching rescue teams:', error)
            throw new Error('Failed to fetch rescue teams')
        }
    }
}

export default new RescueTeamService()
