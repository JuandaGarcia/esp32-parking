import * as admin from 'firebase-admin'

const firebasePrivateKey: string = process.env.FIREBASE_PRIVATE_KEY ?? ''

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert({
			projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
			clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
			privateKey: firebasePrivateKey.replace(/\\n/g, '\n'),
		}),
	})
}

export const db = admin.firestore()
export const auth = admin.auth()
export const firestore = admin.firestore
