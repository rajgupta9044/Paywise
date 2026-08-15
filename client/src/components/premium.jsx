import React from 'react'
import { Alert, Card, CardContent, Container, Grid, Button, Typography, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import config from '../config.json'
import { createPremiumOrder, verifyPremiumPayment } from '../api'

export const hasPremiumAccess = profile => profile?.role === 'admin' || profile?.isPremium === true

export function UpgradeButton() {
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const startPayment = async () => {
    setLoading(true); setError('')
    try {
      const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.async = true
      await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; document.body.appendChild(script) })
      const { data: order } = await createPremiumOrder()
      if (order.status === 'already_active') { window.location.reload(); return }
      const options = { key: order.keyId, amount: order.amount, currency: order.currency, name: order.name, description: 'PayWise Premium access', order_id: order.orderId, prefill: { email: order.email }, handler: async response => { await verifyPremiumPayment(response); const profile = JSON.parse(localStorage.getItem('profile') || '{}'); localStorage.setItem('profile', JSON.stringify({ ...profile, isPremium: true })); window.location.reload() } }
      new window.Razorpay(options).open()
    } catch (err) { setError(err.response?.data?.message || 'Unable to start Razorpay checkout') } finally { setLoading(false) }
  }
  return <Stack alignItems="center" spacing={1}><Button variant="contained" onClick={startPayment} disabled={loading}>{loading ? 'Opening checkout…' : 'Upgrade to Premium'}</Button>{error && <Alert severity="error">{error}</Alert>}</Stack>
}

export const PremiumLocked = () => <Card sx={{ maxWidth: 720, mx: 'auto', mt: 4 }}><CardContent sx={{ p: 5, textAlign: 'center' }}><Typography variant="h4" gutterBottom>Premium Feature Locked</Typography><Typography color="text.secondary" paragraph>Unlock deeper control over shared spending with premium tools.</Typography><Stack spacing={1} sx={{ mb: 3 }}><Typography>✓ Budget Management</Typography><Typography>✓ AI Spending Assistant</Typography><Typography>✓ Advanced CSV and PDF Reports</Typography></Stack><UpgradeButton /></CardContent></Card>

export default function Premium() {
  const profile = JSON.parse(localStorage.getItem('profile') || '{}')
  if (!hasPremiumAccess(profile)) return <Container><PremiumLocked /></Container>
  const cards = [['Budget Management', 'Set budgets, monitor category spending, and see how much remains.', config.PREMIUM_BUDGET_URL], ['AI Spending Assistant', 'Ask focused questions about your actual group spending.', config.PREMIUM_ASSISTANT_URL], ['Reports & Export', 'Generate filtered CSV and PDF financial reports.', config.PREMIUM_REPORTS_URL]]
  return <Container><Typography variant="h3" gutterBottom>Premium</Typography><Typography color="text.secondary" paragraph>Advanced tools for understanding and controlling group expenses.</Typography><Grid container spacing={3}>{cards.map(([title, text, path]) => <Grid item xs={12} md={4} key={title}><Card sx={{ height: '100%' }}><CardContent><Typography variant="h5" gutterBottom>{title}</Typography><Typography color="text.secondary" paragraph>{text}</Typography><Button component={RouterLink} to={path} variant="outlined">Open</Button></CardContent></Card></Grid>)}</Grid></Container>
}
