import { Model } from 'sequelize'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

export class BaseModel extends Model {
    toJSON() {
        const values = Object.assign({}, this.get())

        // Format all date fields to Vietnam timezone
        Object.keys(values).forEach((key) => {
            if (
                values[key] instanceof Date ||
                (typeof values[key] === 'string' && values[key].match(/^\d{4}-\d{2}-\d{2}T/))
            ) {
                values[key] = dayjs(values[key]).tz('Asia/Ho_Chi_Minh').format()
            }
        })

        // Remove password from user model
        if (values.password) {
            delete values.password
        }

        return values
    }
}
