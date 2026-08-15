import axios from 'axios'


const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || ''
})

const profile = JSON.parse(localStorage.getItem('profile'))

const accessHeader = {
    headers: {
      'Authorization': `Bearer ${profile?.accessToken || ''}`
  }
}
const premiumHeader = () => ({ headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('profile') || '{}')?.accessToken || ''}` } })

export const loginIn = (formData) => API.post('/api/users/v1/login', formData)

export const register = (formData) => API.post('/api/users/v1/register', formData)

export const deleteUser = (formData) => API.delete('/api/users/v1/delete', {headers:accessHeader.headers,data:formData})

export const updatePassword = (formData) =>API.post('/api/users/v1/updatePassword', formData, accessHeader)

export const getUser = (formData) => API.post('/api/users/v1/view', formData, accessHeader)

export const editUser = (formData) => API.post('/api/users/v1/edit', formData, accessHeader)

export const getUserGroups = (formData) => API.post('/api/group/v1/user', formData, accessHeader)

export const getEmailList = () => API.get('/api/users/v1/emailList', accessHeader)

export const createGroup = (formData) => API.post('/api/group/v1/add', formData,  accessHeader)

export const editGroup = (formData) => API.post('/api/group/v1/edit', formData, accessHeader)

export const getGroupDetails = (formData) => API.post('/api/group/v1/view', formData, accessHeader)

export const getGroupExpense = (formData) => API.post('/api/expense/v1/group', formData, accessHeader)

export const addExpense = (formDate) => API.post('/api/expense/v1/add', formDate, accessHeader)

export const editExpense = (formDate) => API.post('/api/expense/v1/edit', formDate, accessHeader)

export const deleteExpense = (formData) => API.delete('/api/expense/v1/delete', {headers:accessHeader.headers,data:formData})

export const getGroupCategoryExp = (formData) => API.post('/api/expense/v1/group/categoryExp', formData, accessHeader)

export const getGroupMonthlyExp = (formData) => API.post('/api/expense/v1/group/monthlyExp', formData, accessHeader)

export const getGroupDailyExp = (formData) => API.post('/api/expense/v1/group/dailyExp', formData, accessHeader)

export const getUserExpense = (formData) => API.post('/api/expense/v1/user', formData, accessHeader)

export const getUserMonthlyExp = (formData) => API.post('/api/expense/v1/user/monthlyExp', formData, accessHeader)

export const getUserDailyExp = (formData) => API.post('/api/expense/v1/user/dailyExp', formData, accessHeader)

export const getUserCategoryExp = (formData) => API.post('/api/expense/v1/user/categoryExp', formData, accessHeader)

export const getRecentUserExp = (formData) => API.post('/api/expense/v1/user/recent', formData, accessHeader)

export const getExpDetails = (formData) => API.post('/api/expense/v1/view', formData, accessHeader)

export const getSettle = (formData) => API.post('/api/group/v1/settlement', formData, accessHeader)

export const makeSettle = (formData) => API.post('/api/group/v1/makeSettlement', formData, accessHeader)

export const listBudgets = (groupId) => API.post('/api/budget/list', { groupId }, premiumHeader())
export const createBudget = (data) => API.post('/api/budget/add', data, premiumHeader())
export const updateBudget = (data) => API.put('/api/budget/edit', data, premiumHeader())
export const deleteBudget = (data) => API.delete('/api/budget/delete', { ...premiumHeader(), data })
export const getBudgetSummary = (data) => API.post('/api/budget/summary', data, premiumHeader())
export const askSpendingAssistant = (data) => API.post('/api/ai/v1/expense-insights', data, premiumHeader())
export const exportReport = (format, data) => API.post(`/api/reports/v1/${format}`, data, { ...premiumHeader(), responseType: 'blob' })
export const getReportSummary = (data) => API.post('/api/reports/v1/summary', data, premiumHeader())
export const createPremiumOrder = () => API.post('/api/payments/v1/order', {}, premiumHeader())
export const verifyPremiumPayment = (data) => API.post('/api/payments/v1/verify', data, premiumHeader())
