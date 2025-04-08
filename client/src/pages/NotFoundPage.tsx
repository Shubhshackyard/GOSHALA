import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you were looking for doesn't exist or has been moved.
        </Typography>
        <Button component={Link} to="/" variant="contained" color="primary">
          Return to Homepage
        </Button>
      </Box>
    </Container>
  );
}