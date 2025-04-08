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
  DialogActions
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../contexts/AuthContext';
import forumService, { PostDetail } from '../../services/forumService';
import CommentSection from './CommentSection';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation(['forum', 'common']);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [post, setPost] = useState<PostDetail | null>(null);
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
        const postData = await forumService.getPost(id);
        setPost(postData);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);
  
  const handleLikeToggle = async () => {
    if (!currentUser || !post || !id) return;
    
    try {
      await forumService.togglePostLike(id);
      
      // Update post likes in state
      setPost(prevPost => {
        if (!prevPost) return null;
        
        const isLiked = prevPost.likes.includes(currentUser.id);
        return {
          ...prevPost,
          likes: isLiked 
            ? prevPost.likes.filter(likeId => likeId !== currentUser.id)
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
      
      // Create the comment content object with translations
      const commentContent: Record<string, string> = {};
      commentContent[navigator.language.split('-')[0] || 'en'] = comment;
      
      const newComment = await forumService.createComment(id, {
        content: commentContent
      });
      
      // Add the new comment to the post
      setPost(prevPost => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          comments: [newComment, ...prevPost.comments]
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
  
  const isAuthor = post && currentUser && post.author._id === currentUser.id;
  const isLiked = post && currentUser && post.likes.includes(currentUser.id);
  
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
          <Typography variant="h5" color="error" gutterBottom>
            {error || t('errors.postNotFound', { ns: 'forum', defaultValue: 'Post not found' })}
          </Typography>
          <Button 
            component={Link} 
            to="/forum" 
            startIcon={<ArrowBackIcon />}
          >
            {t('backToForum', { ns: 'forum', defaultValue: 'Back to Forum' })}
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {/* Back button */}
      <Button 
        component={Link} 
        to="/forum" 
        startIcon={<ArrowBackIcon />} 
        sx={{ mb: 2 }}
      >
        {t('backToForum', { ns: 'forum', defaultValue: 'Back to Forum' })}
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
                {t('posts.by', { ns: 'forum' })} {post.author.name} {t('posts.on', { ns: 'forum' })} {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
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
          <ReactMarkdown>
            {post.content}
          </ReactMarkdown>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip 
            label={t(`categories.${post.category}`, { ns: 'forum' })} 
            color="primary" 
            variant="outlined" 
          />
          {post.tags.map((tag, index) => (
            <Chip 
              key={index} 
              label={tag} 
              variant="outlined" 
            />
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {post.views} {t('posts.views', { ns: 'forum' })}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                color={isLiked ? 'primary' : 'default'} 
                onClick={handleLikeToggle}
                disabled={!currentUser}
              >
                {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="body2">
                {post.likes.length}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      {/* Comments section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('postDetail.comments', { ns: 'forum' })} ({post.comments.length})
        </Typography>
        
        {currentUser ? (
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('comment.placeholder', { ns: 'forum' })}
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
                  t('comment.submit', { ns: 'forum' })
                }
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography>
              {t('errors.unauthorized', { ns: 'forum' })}
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
        
        {post.comments.length > 0 ? (
          <CommentSection 
            comments={post.comments} 
            postId={post._id} 
          />
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
        <DialogTitle>{t('confirmation.deletePostTitle', { ns: 'forum' })}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('confirmation.deletePostMessage', { ns: 'forum' })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('confirmation.cancel', { ns: 'forum' })}
          </Button>
          <Button onClick={handleDeletePost} color="error">
            {t('confirmation.confirm', { ns: 'forum' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PostDetailPage;