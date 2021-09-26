// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
	status: number
}

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method === 'POST') {
		console.log(req.body)
		res.status(200).json({ status: 200 })
	} else {
		res.status(404).json({ status: 404 })
	}
}
