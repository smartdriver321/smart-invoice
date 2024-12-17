'use server'

import { redirect } from 'next/navigation'
import { requireUser } from './utils/hooks'
import { parseWithZod } from '@conform-to/zod'

import prisma from './utils/db'
import baseURL from '@/lib/utils'
import { emailClient } from './utils/mailtrap'
import { formatCurrency } from './utils/formatCurrency'
import { invoiceSchema, onboardingSchema } from './utils/zodSchemas'

export async function onboardUser(prevState: any, formData: FormData) {
	const session = await requireUser()
	const submission = parseWithZod(formData, {
		schema: onboardingSchema,
	})

	if (submission.status !== 'success') {
		return submission.reply()
	}

	const data = await prisma.user.update({
		where: {
			id: session.user?.id,
		},
		data: {
			firstName: submission.value.firstName,
			lastName: submission.value.lastName,
			address: submission.value.address,
		},
	})

	return redirect(`${baseURL}/dashboard`)
}

export async function createInvoice(prevState: any, formData: FormData) {
	const session = await requireUser()
	const submission = parseWithZod(formData, {
		schema: invoiceSchema,
	})

	if (submission.status !== 'success') {
		return submission.reply()
	}

	const data = await prisma.invoice.create({
		data: {
			clientAddress: submission.value.clientAddress,
			clientEmail: submission.value.clientEmail,
			clientName: submission.value.clientName,
			currency: submission.value.currency,
			date: submission.value.date,
			dueDate: submission.value.dueDate,
			fromAddress: submission.value.fromAddress,
			fromEmail: submission.value.fromEmail,
			fromName: submission.value.fromName,
			invoiceItemDescription: submission.value.invoiceItemDescription,
			invoiceItemQuantity: submission.value.invoiceItemQuantity,
			invoiceItemRate: submission.value.invoiceItemRate,
			invoiceName: submission.value.invoiceName,
			invoiceNumber: submission.value.invoiceNumber,
			status: submission.value.status,
			total: submission.value.total,
			note: submission.value.note,
			userId: session.user?.id,
		},
	})

	const sender = {
		email: 'hello@demomailtrap.com',
		name: 'demomailtrap',
	}

	emailClient.send({
		from: sender,
		to: [{ email: 'tinggaldidisneyland@gmail.com' }],
		template_uuid: '88097d3e-0ee3-44a8-baa1-d24409f2ccb8',
		template_variables: {
			clientName: submission.value.clientName,
			invoiceNumber: submission.value.invoiceNumber,
			invoiceDueDate: new Intl.DateTimeFormat('en-US', {
				dateStyle: 'long',
			}).format(new Date(submission.value.date)),
			invoiceAmount: formatCurrency({
				amount: submission.value.total,
				currency: submission.value.currency as any,
			}),
			invoiceLink: `${baseURL}/api/invoice/${data.id}`,
		},
	})

	return redirect(`${baseURL}/dashboard/invoices`)
}

export async function editInvoice(prevState: any, formData: FormData) {
	const session = await requireUser()

	const submission = parseWithZod(formData, {
		schema: invoiceSchema,
	})

	if (submission.status !== 'success') {
		return submission.reply()
	}

	const data = await prisma.invoice.update({
		where: {
			id: formData.get('id') as string,
			userId: session.user?.id,
		},
		data: {
			clientAddress: submission.value.clientAddress,
			clientEmail: submission.value.clientEmail,
			clientName: submission.value.clientName,
			currency: submission.value.currency,
			date: submission.value.date,
			dueDate: submission.value.dueDate,
			fromAddress: submission.value.fromAddress,
			fromEmail: submission.value.fromEmail,
			fromName: submission.value.fromName,
			invoiceItemDescription: submission.value.invoiceItemDescription,
			invoiceItemQuantity: submission.value.invoiceItemQuantity,
			invoiceItemRate: submission.value.invoiceItemRate,
			invoiceName: submission.value.invoiceName,
			invoiceNumber: submission.value.invoiceNumber,
			status: submission.value.status,
			total: submission.value.total,
			note: submission.value.note,
		},
	})

	const sender = {
		email: 'hello@demomailtrap.com',
		name: 'demomailtrap',
	}

	emailClient.send({
		from: sender,
		to: [{ email: 'tinggaldidisneyland@gmail.com' }],
		template_uuid: '88097d3e-0ee3-44a8-baa1-d24409f2ccb8',
		template_variables: {
			clientName: submission.value.clientName,
			invoiceNumber: submission.value.invoiceNumber,
			invoiceDueDate: new Intl.DateTimeFormat('en-US', {
				dateStyle: 'long',
			}).format(new Date(submission.value.date)),
			invoiceAmount: formatCurrency({
				amount: submission.value.total,
				currency: submission.value.currency as any,
			}),
			invoiceLink: `${baseURL}/api/invoice/${data.id}`,
		},
	})

	return redirect(`${baseURL}/dashboard/invoices`)
}

export async function deleteInvoice(invoiceId: string) {
	const session = await requireUser()
	const data = await prisma.invoice.delete({
		where: {
			userId: session.user?.id,
			id: invoiceId,
		},
	})

	return redirect(`${baseURL}/dashboard/invoices`)
}

export async function markAsPaidAction(invoiceId: string) {
	const session = await requireUser()
	const data = await prisma.invoice.update({
		where: {
			userId: session.user?.id,
			id: invoiceId,
		},
		data: {
			status: 'PAID',
		},
	})

	return redirect(`${baseURL}/dashboard/invoices`)
}
