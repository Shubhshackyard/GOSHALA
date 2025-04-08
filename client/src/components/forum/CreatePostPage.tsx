import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PostForm from './PostForm';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const CreatePostPage: React.FC = () => {
  const { t } = useTranslation(['forum', 'common']);
  const { currentUser } = useAuth();

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('createPost.title', { ns: 'forum' })}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {t('createPost.subtitle', { ns: 'forum', defaultValue: 'Share your knowledge with the community' })}
        </Typography>
      </Box>
      
      <PostForm />
    </Container>
  );
};

export default CreatePostPage;