import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import forumService from '../../services/forumService';
import PostForm from './PostForm';

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation(['forum', 'common']);
  const { currentUser } = useAuth();
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const postData = await forumService.getPost(id);
        
        // Check if current user is the author
        if (currentUser && postData.author._id !== currentUser.id) {
          setError('You do not have permission to edit this post');
          return;
        }
        
        setPost(postData);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id, currentUser]);
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ my: 4 }}>
        <Typography variant="h5" color="error">
          {error}
        </Typography>
      </Container>
    );
  }
  
  if (!post) {
    return <Navigate to="/forum" />;
  }
  
  // Format post for the form
  const initialValues = {
    title: post.title,
    content: post.content,
    category: post.category,
    tags: post.tags
  };
  
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('postDetail.edit', { ns: 'forum' })}
        </Typography>
      </Box>
      
      <PostForm
        initialValues={initialValues}
        postId={id}
        isEdit={true}
      />
    </Container>
  );
};

export default EditPostPage;