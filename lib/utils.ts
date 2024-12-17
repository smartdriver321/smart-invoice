import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

const baseURL =
	process.env.NODE_ENV === 'development'
		? process.env.NEXT_PUBLIC_DEV_URL
		: process.env.NEXT_PUBLIC_APP_URL

export default baseURL
