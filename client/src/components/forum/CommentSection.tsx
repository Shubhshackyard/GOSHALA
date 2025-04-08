import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Collapse,
  Paper
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import forumService, { Comment } from '../../services/forumService';
import ReactMarkdown from 'react-markdown';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onCommentUpdate: (commentId: string, updatedComment: Comment) => void;
  onCommentDelete: (commentId: string) => void;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  onCommentUpdate,
  onCommentDelete,
  level = 0
}) => {
  const { t } = useTranslation(['forum', 'common']);
  const { currentUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReplies, setShowReplies] = useState(level < 1);
  
  const isAuthor = currentUser && comment.author._id === currentUser.id;
  const isLiked = currentUser && comment.likes.includes(currentUser.id);
  const hasReplies = comment.replies && comment.replies.length > 0;
  
  const handleLikeToggle = async () => {
    if (!currentUser) return;
    
    try {
      await forumService.toggleCommentLike(comment._id);
      
      // Update comment likes locally
      const updatedLikes = isLiked
        ? comment.likes.filter(id => id !== currentUser.id)
        : [...comment.likes, currentUser.id];
      
      onCommentUpdate(comment._id, {
        ...comment,
        likes: updatedLikes
      });
    } catch (err) {
      console.error('Error toggling comment like:', err);
    }
  };
  
  const handleEditSubmit = async () => {
    if (!editContent.trim()) return;
    
    try {
      // Create the comment content object with translations
      const commentContent: Record<string, string> = {};
      commentContent[navigator.language.split('-')[0] || 'en'] = editContent;
      
      const updatedComment = await forumService.updateComment(comment._id, {
        content: commentContent
      });
      
      onCommentUpdate(comment._id, updatedComment);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };
  
  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !currentUser) return;
    
    try {
      // Create the reply content object with translations
      const replyContentObj: Record<string, string> = {};
      replyContentObj[navigator.language.split('-')[0] || 'en'] = replyContent;
      
      const newReply = await forumService.createComment(postId, {
        content: replyContentObj,
        parentComment: comment._id
      });
      
      // Add to replies locally
      const updatedReplies = comment.replies ? [...comment.replies, newReply] : [newReply];
      onCommentUpdate(comment._id, {
        ...comment,
        replies: updatedReplies
      });
      
      setReplyContent('');
      setIsReplying(false);
      setShowReplies(true);
    } catch (err) {
      console.error('Error posting reply:', err);
    }
  };
  
  const handleDelete = async () => {
    try {
      await forumService.deleteComment(comment._id);
      onCommentDelete(comment._id);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };
  
  return (
    <Box sx={{ mb: 2, ml: level * 4 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                {comment.isEdited && (
                  <span> ({t('postDetail.edited', { ns: 'forum' })})</span>
                )}
              </Typography>
            </Box>
          </Box>
          
          {isAuthor && !isEditing && (
            <Box>
              <IconButton size="small" onClick={() => setIsEditing(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => setShowDeleteDialog(true)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
        
        {isEditing ? (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                size="small" 
                onClick={() => setIsEditing(false)}
              >
                {t('comment.cancel', { ns: 'forum' })}
              </Button>
              <Button 
                size="small" 
                variant="contained" 
                onClick={handleEditSubmit}
                disabled={!editContent.trim()}
              >
                {t('comment.submit', { ns: 'forum' })}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ my: 1 }}>
            <ReactMarkdown>
              {comment.content}
            </ReactMarkdown>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              size="small" 
              onClick={handleLikeToggle}
              color={isLiked ? 'primary' : 'default'}
              disabled={!currentUser}
            >
              {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {comment.likes.length}
            </Typography>
            
            {currentUser && !isReplying && level < 2 && (
              <Button 
                startIcon={<ReplyIcon />} 
                size="small"
                onClick={() => setIsReplying(true)}
              >
                {t('postDetail.reply', { ns: 'forum' })}
              </Button>
            )}
          </Box>
          
          {hasReplies && (
            <Button 
              size="small"
              endIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowReplies(!showReplies)}
            >
              {showReplies 
                ? t('comment.hideReplies', { ns: 'forum' })
                : t('comment.replies', { ns: 'forum' }) + ` (${comment.replies?.length})`
              }
            </Button>
          )}
        </Box>
      </Paper>
      
      {/* Reply form */}
      {isReplying && (
        <Box sx={{ mt: 2, ml: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={t('comment.placeholder', { ns: 'forum' })}
            variant="outlined"
            size="small"
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              size="small" 
              onClick={() => setIsReplying(false)}
            >
              {t('comment.cancel', { ns: 'forum' })}
            </Button>
            <Button 
              size="small" 
              variant="contained" 
              onClick={handleReplySubmit}
              disabled={!replyContent.trim()}
            >
              {t('comment.submit', { ns: 'forum' })}
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Replies */}
      {hasReplies && (
        <Collapse in={showReplies}>
          <Box sx={{ mt: 1 }}>
            {comment.replies?.map(reply => (
              <CommentItem
                key={reply._id}
                comment={reply}
                postId={postId}
                onCommentUpdate={onCommentUpdate}
                onCommentDelete={onCommentDelete}
                level={level + 1}
              />
            ))}
          </Box>
        </Collapse>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>{t('confirmation.deleteCommentTitle', { ns: 'forum' })}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('confirmation.deleteCommentMessage', { ns: 'forum' })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            {t('confirmation.cancel', { ns: 'forum' })}
          </Button>
          <Button onClick={handleDelete} color="error">
            {t('confirmation.confirm', { ns: 'forum' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments: initialComments, postId }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  
  const handleCommentUpdate = (commentId: string, updatedComment: Comment) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment._id === commentId 
          ? updatedComment 
          : {
              ...comment,
              replies: comment.replies
                ? comment.replies.map(reply => 
                    reply._id === commentId ? updatedComment : reply
                  )
                : []
            }
      )
    );
  };
  
  const handleCommentDelete = (commentId: string) => {
    setComments(prevComments => 
      prevComments
        .filter(comment => comment._id !== commentId)
        .map(comment => ({
          ...comment,
          replies: comment.replies
            ? comment.replies.filter(reply => reply._id !== commentId)
            : []
        }))
    );
  };
  
  return (
    <Box>
      {comments.map(comment => (
        <CommentItem
          key={comment._id}
          comment={comment}
          postId={postId}
          onCommentUpdate={handleCommentUpdate}
          onCommentDelete={handleCommentDelete}
        />
      ))}
    </Box>
  );
};

export default CommentSection;