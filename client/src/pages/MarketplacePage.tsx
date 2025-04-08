import { Container, Typography, Paper } from '@mui/material';

export default function MarketplacePage() {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Marketplace</Typography>
        <Typography variant="body1">Marketplace content will be implemented here.</Typography>
      </Paper>
    </Container>
  );
}