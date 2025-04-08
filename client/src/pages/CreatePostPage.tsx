import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import forumService from '../services/forumService';
import { SelectChangeEvent } from '@mui/material/Select';

const CreatePostPage: React.FC = () => {
  const { t } = useTranslation('forum');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  const [formData, setState] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[]
  });
  
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCategoryChange = (e: SelectChangeEvent) => {
    setState(prev => ({ ...prev, category: e.target.value }));
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
      setState(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    
    setTagInput('');
  };
  
  const removeTag = (tagToRemove: string) => {
    setState(prev => ({
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
    
    try {
      setLoading(true);
      
      // Create a local copy of the data for submission
      const finalFormData = { ...formData };
      
      // Add any remaining tag directly to this local copy
      const tag = tagInput.trim().toLowerCase();
      if (tag && !finalFormData.tags.includes(tag)) {
        finalFormData.tags = [...finalFormData.tags, tag];
      }
      
      // Use the finalFormData with the potentially added tag
      const postInputData = {
        title: { en: finalFormData.title },
        content: { en: finalFormData.content },
        category: finalFormData.category,
        tags: finalFormData.tags
      };
      
      // Create the post
      const response = await forumService.createPost(postInputData);
      
      // Navigate to the post detail page
      if (response && typeof response === 'object') {
        // Check various possible response structures
        const r = response as Record<string, any>;
        const postId = r._id || 
                          (r.data && typeof r.data === 'object' && r.data._id) ||
                          (r.post && typeof r.post === 'object' && r.post._id);
                      
        if (postId) {
          navigate(`/forum/posts/${postId}`);
        } else {
          console.error('Could not find post ID in response:', response);
          setError('Post was created but couldn\'t navigate to it. Please check the forum.');
        }
      } else {
        console.error('Invalid response from create post API:', response);
        setError('Received invalid response from server');
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      if (error.response) {
        // Server responded with an error
        setError(error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        // Request was made but no response
        setError('Network error. Please check your connection.');
      } else {
        setError('Error creating post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('createPost.title')}
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          {t('createPost.subtitle')}
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
              onClick={() => navigate('/forum')}
              disabled={loading}
            >
              {t('createPost.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('createPost.submit')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreatePostPage;