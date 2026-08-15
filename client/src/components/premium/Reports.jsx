import { useEffect, useState } from 'react'
import { Alert, Button, Card, CardContent, Container, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { exportReport, getReportSummary } from '../../api'
import { hasPremiumAccess, PremiumLocked } from '../premium'
import { getUserGroupsService } from '../../services/groupServices'

export default function Reports() {
  const profile = JSON.parse(localStorage.getItem('profile') || '{}')
  const [groups, setGroups] = useState([])
  const [summary, setSummary] = useState(null)
  const [form, setForm] = useState({ groupId: '', startDate: '', endDate: '', category: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (hasPremiumAccess(profile)) getUserGroupsService(profile).then(r => setGroups(r?.data?.groups || []))
  }, [])

  if (!hasPremiumAccess(profile)) return <Container><PremiumLocked /></Container>

  const loadSummary = async () => {
    try { const r = await getReportSummary(form); setSummary(r.data.summary) }
    catch (e) { setError(e.response?.data?.message || 'Unable to load summary') }
  }

  const download = async format => {
    try {
      const r = await exportReport(format, form)
      const url = URL.createObjectURL(r.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `paywise-report.${format}`
      link.click()
      URL.revokeObjectURL(url)
    } catch (e) { setError(e.response?.data?.message || 'Unable to generate report') }
  }

  return <Container><Typography variant="h3" gutterBottom>Premium Reports</Typography><Typography color="text.secondary" paragraph>Filter group spending, review summary cards, and export CSV or PDF reports.</Typography>{error && <Alert severity="error">{error}</Alert>}<Stack spacing={2} sx={{ maxWidth: 600 }}><TextField select label="Group" value={form.groupId} onChange={e => setForm({ ...form, groupId: e.target.value })}>{groups.map(g => <MenuItem value={g._id} key={g._id}>{g.groupName}</MenuItem>)}</TextField><TextField label="Start date" type="date" InputLabelProps={{ shrink: true }} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /><TextField label="End date" type="date" InputLabelProps={{ shrink: true }} value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /><TextField label="Category (optional)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /><Stack direction="row" spacing={2} flexWrap="wrap"><Button variant="outlined" disabled={!form.groupId} onClick={loadSummary}>Refresh summary</Button><Button variant="contained" disabled={!form.groupId} onClick={() => download('csv')}>Download CSV</Button><Button variant="outlined" disabled={!form.groupId} onClick={() => download('pdf')}>Download PDF</Button></Stack></Stack>{summary && <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 4 }}>{[['Total Spending', summary.totalSpending], ['Average Expense', summary.averageExpense], ['Largest Expense', summary.largestExpense], ['Top Category', summary.topCategory], ['Outstanding', summary.outstanding]].map(([label, value]) => <Card key={label}><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h6">{typeof value === 'number' ? value.toFixed(2) : value}</Typography></CardContent></Card>)}</Stack>}</Container>
}
