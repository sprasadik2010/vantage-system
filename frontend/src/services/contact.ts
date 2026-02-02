// services/contact.ts
import api from './api'
import { type ContactFormData, type ContactMessage } from '../types'

export const submitContactForm = async (data: ContactFormData): Promise<ContactMessage> => {
  const response = await api.post('/contact/', data)
  return response.data
}

export const getContactMessages = async (params?: {
  skip?: number
  limit?: number
}): Promise<ContactMessage[]> => {
  const response = await api.get('/contact/', { params })
  return response.data
}

export const updateMessageStatus = async (
  messageId: number,
  status: string
): Promise<void> => {
  await api.patch(`/contact/${messageId}`, { status })
}