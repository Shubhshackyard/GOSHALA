import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Paper, 
  Typography, 
  Divider 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ForumCategory } from '../../services/forumService';

interface CategoryListProps {
  categories: ForumCategory[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}) => {
  const { t } = useTranslation('forum');
  
  return (
    <Paper sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        {t('categories.title')}
      </Typography>
      <Divider />
      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton 
            selected={selectedCategory === ''} 
            onClick={() => onSelectCategory('')}
            sx={{ 
              '&.Mui-selected': { 
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                }
              }
            }}
          >
            <ListItemText primary={t('categories.all')} />
          </ListItemButton>
        </ListItem>
        {categories.map((category) => (
          <ListItem disablePadding key={category.id}>
            <ListItemButton
              selected={selectedCategory === category.id}
              onClick={() => onSelectCategory(category.id)}
              sx={{ 
                '&.Mui-selected': { 
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  }
                }
              }}
            >
              <ListItemText primary={t(category.nameKey)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default CategoryList;