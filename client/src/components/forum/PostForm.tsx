import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  CircularProgress,
  Grid
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import forumService, { ForumCategory, PostInput } from '../../services/forumService';
import { MDXEditor } from '@mdxeditor/editor';

interface PostFormProps {
  initialValues?: {
    title: Record<string, string>;
    content: Record<string, string>;
    category: string;
    tags: string[];
  };
  postId?: string;
  isEdit?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ initialValues, postId, isEdit = false }) => {
  const { t, i18n } = useTranslation(['forum', 'common']);
  const navigate = useNavigate();
  const currentLang = i18n.language || 'en';
  
  // Form state
  const [title, setTitle] = useState<Record<string, string>>({});
  const [content, setContent] = useState<Record<string, string>>({});
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form errors
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    category: ''
  });
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await forumService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
    
    // Set initial values if provided (for edit mode)
    if (initialValues) {
      setTitle(initialValues.title);
      setContent(initialValues.content);
      setCategory(initialValues.category);
      setTagsInput(initialValues.tags.join(', '));
    }
  }, [initialValues]);
  
  const validateForm = (): boolean => {
    const newErrors = {
      title: '',
      content: '',
      category: ''
    };
    
    if (!title[currentLang]?.trim()) {
      newErrors.title = t('errors.titleRequired', { ns: 'forum' });
    }
    
    if (!content[currentLang]?.trim()) {
      newErrors.content = t('errors.contentRequired', { ns: 'forum' });
    }
    
    if (!category) {
      newErrors.category = t('errors.categoryRequired', { ns: 'forum' });
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };
  
  const handleSubmit = async (event: React.FormEvent, isDraft = false) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      // Process tags
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      
      const postData: PostInput = {
        title,
        content,
        category,
        tags,
        status: isDraft ? 'draft' : 'published'
      };
      
      if (isEdit && postId) {
        await forumService.updatePost(postId, postData);
      } else {
        await forumService.createPost(postData);
      }
      
      navigate('/forum');
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle({
      ...title,
      [currentLang]: event.target.value
    });
    
    if (event.target.value) {
      setErrors({
        ...errors,
        title: ''
      });
    }
  };
  
  const handleContentChange = (mdxContent: string) => {
    setContent({
      ...content,
      [currentLang]: mdxContent
    });
    
    if (mdxContent) {
      setErrors({
        ...errors,
        content: ''
      });
    }
  };
  
  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCategory(event.target.value as string);
    setErrors({
      ...errors,
      category: ''
    });
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? t('postDetail.edit', { ns: 'forum' }) : t('createPost.title', { ns: 'forum' })}
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={(e) => handleSubmit(e)}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label={t('createPost.titlePlaceholder', { ns: 'forum' })}
              value={title[currentLang] || ''}
              onChange={handleTitleChange}
              error={!!errors.title}
              helperText={errors.title}
              disabled={submitting}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('createPost.contentPlaceholder', { ns: 'forum' })}
            </Typography>
            <MDXEditor
              markdown={content[currentLang] || ''}
              onChange={handleContentChange}
              contentEditableClassName="mdx-editor-content"
            />
            {errors.content && (
              <FormHelperText error>{errors.content}</FormHelperText>
            )}
          </Box>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs:12, sm:6 }}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel id="category-label">{t('createPost.category', { ns: 'forum' })}</InputLabel>
                <Select
                  labelId="category-label"
                  value={category}
                  onChange={handleCategoryChange}
                  label={t('createPost.category', { ns: 'forum' })}
                  disabled={submitting}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {t(cat.nameKey, { ns: 'forum' })}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs:12, sm:6 }}>
              <TextField
                fullWidth
                label={t('createPost.tags', { ns: 'forum' })}
                placeholder={t('createPost.tagsPlaceholder', { ns: 'forum' })}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={submitting}
                helperText={t('createPost.tagsPlaceholder', { ns: 'forum' })}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/forum')}
              disabled={submitting}
            >
              {t('createPost.cancel', { ns: 'forum' })}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={(e) => handleSubmit(e, true)}
              disabled={submitting}
            >
              {t('createPost.draft', { ns: 'forum' })}
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} /> : t('createPost.submit', { ns: 'forum' })}
            </Button>
          </Box>
        </form>
      )}
    </Paper>
  );
};

export default PostForm;