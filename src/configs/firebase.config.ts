import * as admin from 'firebase-admin'
import serviceAccount from './tracking-pushnoti.json'

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
})

export const firebaseAdmin = admin
