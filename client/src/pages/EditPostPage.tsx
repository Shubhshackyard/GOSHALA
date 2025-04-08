import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Chip,
  Alert,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import forumService from '../services/forumService';

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('forum');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[]
  });
  
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingPost, setFetchingPost] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setFetchingPost(true);
        const post = await forumService.getPost(id);

        // Handle different possible response structures
        const postData = (post as any).data || post;
        
        // Check if current user is the author
        if (!currentUser || postData.author._id !== currentUser.id) {
          setUnauthorized(true);
          return;
        }
        
        setFormData({
          title: postData.title,
          content: postData.content,
          category: postData.category,
          tags: postData.tags || []
        });
      } catch (err: any) {
        console.error('Error fetching post:', err);
        setError(err.response?.data?.message || 'Failed to load post');
      } finally {
        setFetchingPost(false);
      }
    };
    
    fetchPost();
  }, [id, currentUser]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleCategoryChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({ ...prev, category: e.target.value }));
  };
  
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };
  
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    
    setTagInput('');
  };
  
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError(t('errors.titleRequired'));
      return;
    }
    
    if (!formData.content.trim()) {
      setError(t('errors.contentRequired'));
      return;
    }
    
    if (!formData.category) {
      setError(t('errors.categoryRequired'));
      return;
    }
    
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Add any remaining tag from input
      if (tagInput.trim()) {
        addTag();
      }
      
      // Update the post
      await forumService.updatePost(id, {
        title: { en: formData.title },
        content: { en: formData.content },
        category: formData.category,
        tags: formData.tags
      });
      
      // Navigate to the post detail page
      navigate(`/forum/posts/${id}`);
    } catch (error: any) {
      console.error('Error updating post:', error);
      setError(error.response?.data?.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // Redirect if unauthorized
  if (unauthorized && !fetchingPost) {
    return <Navigate to="/forum" />;
  }
  
  if (fetchingPost) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('postDetail.edit', { defaultValue: 'Edit Post' })}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            name="title"
            label={t('createPost.titlePlaceholder')}
            fullWidth
            margin="normal"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-label">
              {t('createPost.category')}
            </InputLabel>
            <Select
              labelId="category-label"
              id="category"
              value={formData.category}
              onChange={handleCategoryChange}
              required
            >
              <MenuItem value="general">{t('categories.general')}</MenuItem>
              <MenuItem value="organicFarming">{t('categories.organicFarming')}</MenuItem>
              <MenuItem value="cowCare">{t('categories.cowCare')}</MenuItem>
              <MenuItem value="productInfo">{t('categories.productInfo')}</MenuItem>
              <MenuItem value="marketTrends">{t('categories.marketTrends')}</MenuItem>
              <MenuItem value="biodiversity">{t('categories.biodiversity')}</MenuItem>
              <MenuItem value="technical">{t('categories.technical')}</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('createPost.tags')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => removeTag(tag)}
                  size="small"
                />
              ))}
            </Box>
            <TextField
              fullWidth
              placeholder={t('createPost.tagsPlaceholder')}
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              onBlur={addTag}
              helperText={t('createPost.tagsHelperText', { defaultValue: 'Press Enter or comma to add a tag' })}
            />
          </Box>
          
          <TextField
            name="content"
            label={t('createPost.contentPlaceholder')}
            multiline
            rows={10}
            fullWidth
            margin="normal"
            value={formData.content}
            onChange={handleInputChange}
            required
          />
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/forum/posts/${id}`)}
              disabled={loading}
            >
              {t('createPost.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('postDetail.edit')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditPostPage;