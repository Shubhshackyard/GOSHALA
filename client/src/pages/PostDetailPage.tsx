import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Chip, 
  Avatar, 
  Button,
  Divider,
  TextField,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import forumService from '../services/forumService';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation(['forum', 'common']);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await forumService.getPost(id);
        setPost(response);
      } catch (err: any) {
        console.error('Error fetching post:', err);
        setError(err.response?.data?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);
  
  const handleLikeToggle = async () => {
    if (!currentUser || !post || !id) return;
    
    try {
      const isLiked = post.likes.includes(currentUser.id);
      
      await forumService.togglePostLike(id);
      
      // Update post likes in state
      setPost((prevPost: any) => {
        if (!prevPost) return null;
        
        return {
          ...prevPost,
          likes: isLiked 
            ? prevPost.likes.filter((likeId: string) => likeId !== currentUser.id)
            : [...prevPost.likes, currentUser.id]
        };
      });
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !comment.trim() || !id) return;
    
    try {
      setSubmitting(true);
      
      const response = await forumService.createComment(id, {
        content: { en: comment }
      });
      
      // Add the new comment to the post
      setPost((prevPost: any) => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          comments: [response, ...prevPost.comments]
        };
      });
      
      // Clear the comment field
      setComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeletePost = async () => {
    if (!id) return;
    
    try {
      await forumService.deletePost(id);
      navigate('/forum');
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error || !post) {
    return (
      <Container sx={{ my: 8 }}>
        <Paper sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || t('errors.postNotFound', { ns: 'forum' })}
          </Alert>
          <Button 
            component={Link} 
            to="/forum" 
            startIcon={<ArrowBackIcon />}
          >
            {t('backToForum', { ns: 'forum' })}
          </Button>
        </Paper>
      </Container>
    );
  }
  
  const isAuthor = currentUser && post.author._id === currentUser.id;
  const isLiked = currentUser && post.likes.includes(currentUser.id);
  
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {/* Back button */}
      <Button 
        component={Link} 
        to="/forum" 
        startIcon={<ArrowBackIcon />} 
        sx={{ mb: 2 }}
      >
        {t('backToForum', { ns: 'forum' })}
      </Button>
      
      {/* Post content */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {post.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                src={post.author.profileImage} 
                alt={post.author.name} 
                sx={{ width: 32, height: 32, mr: 1 }} 
              />
              <Typography variant="body2" color="text.secondary">
                {t('posts.by', { ns: 'forum', defaultValue: 'Posted by' })} {post.author.name} {t('posts.on', { ns: 'forum', defaultValue: 'on' })} {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          </Box>
          
          {isAuthor && (
            <Box>
              <IconButton 
                component={Link} 
                to={`/forum/edit/${post._id}`}
                color="primary"
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip 
            label={t(`categories.${post.category}`, { ns: 'forum', defaultValue: post.category })} 
            color="primary" 
            variant="outlined" 
          />
          {post.tags && post.tags.map((tag: string, index: number) => (
            <Chip 
              key={index} 
              label={tag} 
              variant="outlined" 
            />
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                color={isLiked ? 'primary' : 'default'} 
                onClick={handleLikeToggle}
                disabled={!currentUser}
              >
                {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="body2">
                {post.likes ? post.likes.length : 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CommentIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {post.comments ? post.comments.length : 0} {t('posts.comments', { ns: 'forum', defaultValue: 'comments' })}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      {/* Comments section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('postDetail.comments', { ns: 'forum', defaultValue: 'Comments' })} ({post.comments ? post.comments.length : 0})
        </Typography>
        
        {currentUser ? (
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('comment.placeholder', { ns: 'forum', defaultValue: 'Write a comment...' })}
              variant="outlined"
              disabled={submitting}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={!comment.trim() || submitting}
              >
                {submitting ? 
                  <CircularProgress size={24} /> : 
                  t('comment.submit', { ns: 'forum', defaultValue: 'Submit' })
                }
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography>
              {t('errors.unauthorized', { ns: 'forum', defaultValue: 'You must be logged in to comment' })}
            </Typography>
            <Button 
              component={Link} 
              to="/login" 
              variant="outlined" 
              sx={{ mt: 1 }}
            >
              {t('navigation.login', { ns: 'common' })}
            </Button>
          </Box>
        )}
        
        <Divider sx={{ mb: 2 }} />
        
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment: any) => (
            <Box key={comment._id} sx={{ mb: 3, pb: 3, borderBottom: '1px solid #eee' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Avatar 
                  src={comment.author.profileImage} 
                  alt={comment.author.name} 
                  sx={{ width: 32, height: 32, mr: 1 }} 
                />
                <Box>
                  <Typography variant="subtitle2">
                    {comment.author.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ ml: 5 }}>
                {comment.content}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            {t('noComments', { ns: 'forum', defaultValue: 'No comments yet. Be the first to comment!' })}
          </Typography>
        )}
      </Paper>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('confirmation.deletePostTitle', { ns: 'forum', defaultValue: 'Delete Post' })}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('confirmation.deletePostMessage', { ns: 'forum', defaultValue: 'Are you sure you want to delete this post? This action cannot be undone.' })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('confirmation.cancel', { ns: 'forum', defaultValue: 'Cancel' })}
          </Button>
          <Button onClick={handleDeletePost} color="error">
            {t('confirmation.confirm', { ns: 'forum', defaultValue: 'Delete' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PostDetailPage;