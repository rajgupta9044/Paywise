import { Box, Card, CardContent, Chip, Container, Grid, Stack, Typography } from '@mui/material'
import Copyright from './Copyright'

const features = [
  ['Group expense tracking', 'Create groups, add members, record shared expenses, and see every member\'s share.'],
  ['Settlements and balances', 'See who will pay and who will get money, then record settlements inside each group.'],
  ['Analytics dashboard', 'Use group and personal charts to understand category, monthly, and daily spending.'],
  ['Premium tools', 'Manage budgets, ask the focused AI Spending Assistant, and export CSV/PDF reports.']
]

export default function About() {
  return (
    <Container maxWidth="lg">
      <Card sx={{ mt: 4, mb: 5 }}>
        <CardContent sx={{ p: { xs: 3, md: 6 } }}>
          <Box textAlign="center">
            <Box component="img" src="/static/paywise-mark.svg" alt="PayWise" sx={{ width: 80, height: 80 }} />
            <Typography variant="h2" sx={{ mt: 2 }}>PayWise</Typography>
            <Typography variant="h6" color="text.secondary">Collaborative group expense management</Typography>
            <Typography sx={{ maxWidth: 760, mx: 'auto', mt: 2 }}>
              PayWise helps friends, families, and teams track shared expenses, split costs fairly,
              settle balances, and make better spending decisions from one clear dashboard.
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ mt: 6, mb: 2 }}>What you can do</Typography>
          <Grid container spacing={2}>
            {features.map(([title, text]) => (
              <Grid item xs={12} sm={6} key={title}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{title}</Typography>
                    <Typography color="text.secondary">{text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h4" sx={{ mt: 6, mb: 2 }}>Built with</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {['React', 'Redux', 'Material UI', 'Chart.js', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'JWT authentication']
              .map(item => <Chip key={item} label={item} />)}
          </Stack>

          <Typography variant="h4" sx={{ mt: 6, mb: 2 }}>Premium features</Typography>
          <Typography color="text.secondary">
            Premium access adds group budget management, category budget tracking, focused AI spending
            insights based on aggregated expense data, and filtered CSV/PDF financial reporting.
            Premium access is controlled by the server and can later be connected to a payment provider.
          </Typography>

          <Box textAlign="center" sx={{ mt: 6 }}><Copyright /></Box>
        </CardContent>
      </Card>
    </Container>
  )
}
