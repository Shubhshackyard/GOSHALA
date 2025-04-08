import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Avatar, 
  CardActions, 
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Post } from '../../services/forumService';
import { formatDistanceToNow } from 'date-fns';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAuth } from '../../contexts/AuthContext';

interface PostCardProps {
  post: Post;
  isSticky?: boolean;
  onLikeToggle?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, isSticky = false, onLikeToggle }) => {
  const { t } = useTranslation('forum');
  const { currentUser } = useAuth();
  
  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const truncatedContent = post.content.length > 150 
    ? `${post.content.substring(0, 150)}...` 
    : post.content;
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLikeToggle) {
      onLikeToggle(post._id);
    }
  };
  
  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderLeft: isSticky ? 4 : 0, 
        borderColor: 'primary.main',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent component={Link} to={`/forum/posts/${post._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
        {isSticky && (
          <Chip 
            label={t('posts.sticky')} 
            size="small" 
            color="primary" 
            sx={{ mb: 1 }} 
          />
        )}
        
        <Typography variant="h6" gutterBottom>
          {post.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={post.author.profileImage} 
            alt={post.author.name}
            sx={{ width: 24, height: 24, mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {t('posts.by')} {post.author.name} {t('posts.on')} {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {truncatedContent}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          <Chip 
            label={t(`categories.${post.category}`)} 
            size="small" 
            color="secondary" 
            variant="outlined"
          />
          {post.tags.slice(0, 3).map((tag, index) => (
            <Chip 
              key={index}
              label={tag} 
              size="small" 
              variant="outlined"
            />
          ))}
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={t('posts.views')}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">{post.views}</Typography>
            </Box>
          </Tooltip>
          
          <Tooltip title={t('posts.comments')}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <ChatBubbleOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">{post.commentCount || 0}</Typography>
            </Box>
          </Tooltip>
          
          <Tooltip title={isLiked ? t('posts.likes') + ' (' + t('postDetail.unlike') + ')' : t('posts.likes')}>
            <IconButton 
              size="small" 
              onClick={handleLikeClick}
              color={isLiked ? 'primary' : 'default'}
              disabled={!currentUser}
            >
              {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {post.likes.length}
              </Typography>
            </IconButton>
          </Tooltip>
        </Box>
        
        <Button 
          component={Link} 
          to={`/forum/posts/${post._id}`} 
          size="small"
        >
          {t('posts.readMore')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default PostCard;