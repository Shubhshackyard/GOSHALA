import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  InputAdornment, 
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Paper
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import PostAddIcon from '@mui/icons-material/PostAdd';
import forumService, { ForumCategory, Post } from '../services/forumService';
import CategoryList from '../components/forum/CategoryList';
import PostCard from '../components/forum/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { SelectChangeEvent } from '@mui/material/Select';

const ForumPage: React.FC = () => {
  const { t } = useTranslation(['forum', 'common']);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // States
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [stickyPosts, setStickyPosts] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  // Query params
  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'latest';
  
  // Local state for form inputs
  const [searchInput, setSearchInput] = useState(searchQuery);
  
  const fetchCategories = async () => {
    try {
      const categoriesData = await forumService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Map sortBy values to API parameters
      const sortMapping: Record<string, { sort: string; order: 'asc' | 'desc' }> = {
        latest: { sort: 'createdAt', order: 'desc' },
        popular: { sort: 'likes', order: 'desc' },
        mostCommented: { sort: 'commentCount', order: 'desc' }
      };
      
      const { sort, order } = sortMapping[sortBy] || sortMapping.latest;
      
      const postsData = await forumService.getPosts({
        page,
        limit: 10,
        sort,
        order,
        category: category || undefined,
        search: searchQuery || undefined
      });
      
      setStickyPosts(postsData.stickyPosts);
      setPosts(postsData.posts);
      setTotalPages(postsData.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  useEffect(() => {
    fetchPosts();
  }, [page, category, searchQuery, sortBy]);
  
  const handleCategoryChange = (selectedCategory: string) => {
    setSearchParams(prev => {
      if (selectedCategory) {
        prev.set('category', selectedCategory);
      } else {
        prev.delete('category');
      }
      prev.set('page', '1');
      return prev;
    });
  };
  
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setSearchParams(prev => {
      prev.set('page', value.toString());
      return prev;
    });
  };
  
  const handleSortChange = (event: SelectChangeEvent) => {
    setSearchParams(prev => {
      prev.set('sort', event.target.value);
      prev.set('page', '1');
      return prev;
    });
  };
  
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchParams(prev => {
      if (searchInput.trim()) {
        prev.set('search', searchInput);
      } else {
        prev.delete('search');
      }
      prev.set('page', '1');
      return prev;
    });
  };
  
  const handleNewPost = () => {
    navigate('/forum/create');
  };
  
  const handlePostLike = async (postId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      await forumService.togglePostLike(postId);
      
      // Update posts and sticky posts
      setPosts(prevPosts => prevPosts.map(post => {
        if (post._id === postId) {
          const isLiked = post.likes.includes(currentUser.id);
          return {
            ...post,
            likes: isLiked 
              ? post.likes.filter(id => id !== currentUser.id) 
              : [...post.likes, currentUser.id]
          };
        }
        return post;
      }));
      
      setStickyPosts(prevPosts => prevPosts.map(post => {
        if (post._id === postId) {
          const isLiked = post.likes.includes(currentUser.id);
          return {
            ...post,
            likes: isLiked 
              ? post.likes.filter(id => id !== currentUser.id) 
              : [...post.likes, currentUser.id]
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('pageTitle', { ns: 'forum' })}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {t('tagline', { ns: 'forum' })}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PostAddIcon />}
          onClick={handleNewPost}
          disabled={!currentUser}
        >
          {t('newPost', { ns: 'forum' })}
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Left sidebar */}
        <Grid size={{ xs:12, md:3}}>
          <CategoryList 
            categories={categories} 
            selectedCategory={category}
            onSelectCategory={handleCategoryChange}
          />
        </Grid>
        
        {/* Main content */}
        <Grid size={{ xs:12, md:9}}>
          {/* Search and filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs:12, md:8, sm:6}}>
            <form onSubmit={handleSearch}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={t('search', { ns: 'forum' })}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </form>
              </Grid>
              <Grid size={{ xs:12, md:4, sm: 6}}>
              <FormControl fullWidth size="small">
                  <InputLabel id="sort-by-label">{t('filters.sortBy', { ns: 'forum' })}</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    id="sort-by"
                    value={sortBy}
                    label={t('filters.sortBy', { ns: 'forum' })}
                    onChange={handleSortChange}
                  >
                    <MenuItem value="latest">{t('filters.latest', { ns: 'forum' })}</MenuItem>
                    <MenuItem value="popular">{t('filters.popular', { ns: 'forum' })}</MenuItem>
                    <MenuItem value="mostCommented">{t('filters.mostCommented', { ns: 'forum' })}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Sticky posts */}
          {stickyPosts.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('posts.sticky', { ns: 'forum' })}
              </Typography>
              {stickyPosts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  isSticky 
                  onLikeToggle={handlePostLike}
                />
              ))}
            </Box>
          )}
          
          {/* Regular posts */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            {searchQuery 
              ? `${t('search', { ns: 'forum' })}: "${searchQuery}"` 
              : category 
                ? t(`categories.${category}`, { ns: 'forum', defaultValue: t('posts.latest', { ns: 'forum' }) })
                : t('posts.latest', { ns: 'forum' })}
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : posts.length > 0 ? (
            <>
              {posts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onLikeToggle={handlePostLike}
                />
              ))}
              
              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
            </>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">{t('posts.noResults', { ns: 'forum' })}</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ForumPage;