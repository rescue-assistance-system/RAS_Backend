import User from '../database/models/user.model'
import bcrypt from 'bcrypt'
import { Op } from 'sequelize'
class CoordinatorService {
    async createCoordinator(data: { username: string; email: string; password: string }) {
        console.log('Creating coordinator with data:', data)
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email: data.email }]
            }
        })

        if (existingUser) {
            throw new Error('User with this email already exists')
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)
        const coordinator = await User.create({
            username: data.username,
            email: data.email,
            password: hashedPassword,
            role: 'coordinator'
        })

        return coordinator
    }
    async getCoordinators() {
        return await User.findAll({ where: { role: 'coordinator' } }) //, attributes: { exclude: ['password'] }
    }

    async getCoordinatorById(id: number) {
        const coordinator = await User.findOne({
            attributes: { exclude: ['password'] },
            where: { id: id, role: 'coordinator' }
        })
        if (!coordinator) {
            throw new Error('Coordinator not found')
        }
        return coordinator
    }

    async updateCoordinator(id: number, data: { username?: string; email?: string; password?: string }) {
        const coordinator = await User.findOne({
            attributes: { exclude: ['password'] },
            where: { id: id, role: 'coordinator' }
        })
        if (!coordinator) {
            throw new Error('Coordinator not found')
        }
        const hashedPassword = await bcrypt.hash(data.password, 10)
        await coordinator.update({ ...data, password: hashedPassword })
        return coordinator
    }

    async deleteCoordinator(id: string) {
        console.log('Deleting coordinator with ID:', id)
        const coordinator = await User.findOne({
            attributes: { exclude: ['password'] },
            where: { id: id, role: 'coordinator' }
        })
        if (!coordinator) {
            throw new Error('Coordinator not found')
        }

        await coordinator.destroy()
        return { message: 'Coordinator deleted successfully' }
    }
}

export default new CoordinatorService()
