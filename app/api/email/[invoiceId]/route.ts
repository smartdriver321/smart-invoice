import { NextResponse } from 'next/server'

import prisma from '@/app/utils/db'
import { requireUser } from '@/app/utils/hooks'
import { emailClient } from '@/app/utils/mailtrap'

export async function POST(
	request: Request,
	{
		params,
	}: {
		params: Promise<{ invoiceId: string }>
	}
) {
	try {
		const session = await requireUser()
		const { invoiceId } = await params
		const invoiceData = await prisma.invoice.findUnique({
			where: {
				id: invoiceId,
				userId: session.user?.id,
			},
		})

		if (!invoiceData) {
			return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
		}

		const sender = {
			email: 'hello@demomailtrap.com',
			name: 'demomailtrap',
		}

		emailClient.send({
			from: sender,
			to: [{ email: 'tinggaldidisneyland@gmail.com' }],
			template_uuid: '88097d3e-0ee3-44a8-baa1-d24409f2ccb8',
			template_variables: {
				first_name: invoiceData.clientName,
				company_info_name: 'CLIENT CORP',
				company_info_address: 'Chad street 124',
				company_info_city: 'Munich',
				company_info_zip_code: '345345',
				company_info_country: 'Germany',
			},
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to send Email reminder' },
			{ status: 500 }
		)
	}
}
