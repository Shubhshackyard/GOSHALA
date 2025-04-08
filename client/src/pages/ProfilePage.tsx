import { Container, Typography, Paper } from '@mui/material';

export default function ProfilePage() {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Profile</Typography>
        <Typography variant="body1">Profile page content will be implemented here.</Typography>
      </Paper>
    </Container>
  );
}