// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { db, auth, firestore } from '../../config/firebaseAdmin'

const adminDocumentId = '7MlVvAvfU3SvOJtWEN1b'

const SendData = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'POST') {
		const {
			acelerometroX,
			acelerometroY,
			password,
			ParkingID,
			desbloqueo,
			proximidad,
		} = req.body

		try {
			const parkingDocument = await db
				.collection('parking_lots')
				.doc(ParkingID)
				.get()
			const parkingData = parkingDocument.data()

			if (!parkingData?.available) {
				if (!parkingData?.password) {
					await db
						.collection('parking_lots')
						.doc(ParkingID)
						.update({ password })
				}

				const date_of_parking = new Date(
					parkingData?.date_of_parking.toDate()
				) as any
				const nowDate = new Date() as any
				const seconds_since_parking = Math.abs(nowDate - date_of_parking) / 1000
				const minutes_since_parking =
					Math.abs(nowDate - date_of_parking) / 1000 / 60

				if (proximidad && !desbloqueo) {
					if (seconds_since_parking > 30 && !desbloqueo) {
						const adminDocument = await db
							.collection('admin')
							.doc(adminDocumentId)
							.get()
						const userAdminNotificationToken =
							adminDocument.data()?.admin_notification_token

						const userOwner = await auth.getUser(parkingData?.owner)

						await sendNotification({
							adminToken: userAdminNotificationToken,
							userToken: parkingData?.user_token,
							parking_lot_name: parkingData?.name,
							parking_place_id: parkingData?.parking_place,
							user_id: parkingData?.owner,
							user_email: userOwner.email || '',
						})
					}
				}

				if (!proximidad && !desbloqueo && minutes_since_parking > 2) {
					await db.collection('parking_lots').doc(ParkingID).update({
						owner: firestore.FieldValue.delete(),
						date_of_parking: firestore.FieldValue.delete(),
						password: firestore.FieldValue.delete(),
						user_token: firestore.FieldValue.delete(),
						available: true,
					})
				}

				if (acelerometroX > 10 && !desbloqueo) {
					const adminDocument = await db
						.collection('admin')
						.doc(adminDocumentId)
						.get()
					const userAdminNotificationToken =
						adminDocument.data()?.admin_notification_token

					const userOwner = await auth.getUser(parkingData?.owner)

					await sendNotification({
						adminToken: userAdminNotificationToken,
						userToken: parkingData?.user_token,
						parking_lot_name: parkingData?.name,
						parking_place_id: parkingData?.parking_place,
						user_id: parkingData?.owner,
						user_email: userOwner.email || '',
					})
				}
			}

			res.status(200).json({ status: 200 })
		} catch (error) {
			console.error(error)
			res.status(500).json({ status: 500 })
		}
	} else {
		res.status(404).json({ status: 404 })
	}
}

const sendNotification = async ({
	adminToken,
	userToken,
	parking_lot_name,
	parking_place_id,
	user_id,
	user_email,
}: {
	adminToken: string
	userToken: string
	parking_lot_name: string
	parking_place_id: string
	user_id: string
	user_email: string
}) => {
	try {
		const parkingPlaceDocument = await db
			.collection('parking_places')
			.doc(parking_place_id)
			.get()
		const parkingPlaceData = parkingPlaceDocument.data()

		const user_message = `Detectamos un movimiento extraño con tu bicicleta en ${parkingPlaceData?.name}.`
		const admin_message = `Detectamos un movimiento extraño con la bicicleta en el parqueadero ${parking_lot_name} en ${parkingPlaceData?.name}.`

		await db.collection('notifications').doc().set({
			user_id,
			user_email,
			user_message,
			admin_message,
			parking_lot_name,
			parking_place_name: parkingPlaceData?.name,
		})

		await fetch('https://exp.host/--/api/v2/push/send', {
			method: 'POST',
			body: JSON.stringify({
				to: adminToken,
				title: 'Alerta de robo',
				body: admin_message,
				data: { type: 'robo' },
				_displayInForeground: true,
			}),
		})
		await fetch('https://exp.host/--/api/v2/push/send', {
			method: 'POST',
			body: JSON.stringify({
				to: userToken,
				title: 'Alerta de robo',
				body: user_message,
				data: { type: 'robo' },
				_displayInForeground: true,
			}),
		})
	} catch (error) {
		console.error(error)
	}
}

export default SendData
