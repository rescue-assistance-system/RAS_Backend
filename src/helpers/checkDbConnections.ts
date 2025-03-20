import { QueryTypes } from 'sequelize'
import Database from '~/database/connection'

const sequelize = Database.getInstance()

/**
 * Get the number of active MySQL connections.
 * @returns {Promise<number>} - The count of active connections
 */
export const getActiveDbConnections = async (): Promise<number> => {
    try {
        const result = await sequelize.query<{ Variable_name: string; Value: string }>(
            "SHOW STATUS LIKE 'Threads_connected';",
            { type: QueryTypes.SELECT }
        )

        // Extract the number of active connections
        const connections = result[0]?.Value ? parseInt(result[0].Value, 10) : -1
        return connections
    } catch (error) {
        console.error('❌ Error fetching DB connections:', error)
        return -1
    }
}
