// import bcrypt from 'bcrypt'
// import User from '../models/user.model'

// export async function seedMockData() {
//     try {
//         // Clear existing data
//         await User.destroy({ where: {} })

//         // Hash passwords
//         const userPassword = await bcrypt.hash('password123', 10)
//         const adminPassword = await bcrypt.hash('adminpass123', 10)
//         const rescuePassword = await bcrypt.hash('rescuepass123', 10)

//         // Insert mock data
//         await User.bulkCreate([
//             {
//                 username: 'user1',
//                 email: 'user1@example.com',
//                 password: userPassword,
//                 role: 'user',
//                 gender: 'male',
//                 birthday: new Date('1990-05-15'),
//                 cccd: '123456789012',
//                 latitude: 10.7769,
//                 longitude: 106.7009,
//                 is_verified: true,
//                 device_id: 'device1'
//             },
//             {
//                 username: 'user2',
//                 email: 'user2@example.com',
//                 password: userPassword,
//                 role: 'user',
//                 gender: 'female',
//                 birthday: new Date('1995-08-20'),
//                 cccd: '123456789013',
//                 latitude: 10.8231,
//                 longitude: 106.6297,
//                 is_verified: true,
//                 device_id: 'device2'
//             },
//             {
//                 username: 'admin1',
//                 email: 'admin1@example.com',
//                 password: adminPassword,
//                 role: 'admin',
//                 gender: 'male',
//                 birthday: new Date('1985-03-10'),
//                 cccd: '123456789014',
//                 latitude: 16.0544,
//                 longitude: 108.2022,
//                 is_verified: true,
//                 device_id: 'device3'
//             },
//             {
//                 username: 'rescue1',
//                 email: 'rescue1@example.com',
//                 password: rescuePassword,
//                 role: 'rescue_team',
//                 gender: 'female',
//                 birthday: new Date('1992-11-25'),
//                 cccd: '123456789015',
//                 latitude: 10.7769,
//                 longitude: 106.7009,
//                 is_verified: true,
//                 device_id: 'device4'
//             },
//             {
//                 username: 'rescue_leader1',
//                 email: 'rescueleader1@example.com',
//                 password: rescuePassword,
//                 role: 'rescue_team',
//                 gender: 'male',
//                 birthday: new Date('1988-07-30'),
//                 cccd: '123456789016',
//                 latitude: 10.7769,
//                 longitude: 106.7009,
//                 is_verified: true,
//                 device_id: 'device5'
//             }
//         ])

//         console.log('✅ Mock data inserted successfully')
//     } catch (error) {
//         console.error('❌ Error inserting mock data:', error)
//         throw error
//     }
// }
