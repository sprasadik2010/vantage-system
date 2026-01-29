import api from './api'
import { type ExcelUpload } from '../types'

export const uploadExcel = async (formData: FormData): Promise<ExcelUpload> => {
  const response = await api.post('/upload/excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const getExcelUploads = async (params?: {
  skip?: number
  limit?: number
}): Promise<ExcelUpload[]> => {
  const response = await api.get('/upload/excel', { params })
  return response.data
}

export const getUserReport = async (params?: {
  start_date?: string
  end_date?: string
}): Promise<any> => {
  const response = await api.get('/admin/reports/users', { params })
  return response.data
}

export const getIncomeReport = async (params?: {
  start_date?: string
  end_date?: string
}): Promise<any> => {
  const response = await api.get('/admin/reports/income', { params })
  return response.data
}