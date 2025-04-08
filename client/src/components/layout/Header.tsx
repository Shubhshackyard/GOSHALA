import { Link } from 'react-router-dom';
import { 
  AppBar, Toolbar, Button, Typography, 
  Box, IconButton, Menu, MenuItem, Avatar 
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function Header() {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
  };
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit' 
          }}
        >
          {t('appName')}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button component={Link} to="/marketplace" color="inherit">
            {t('navigation.marketplace')}
          </Button>
          <Button component={Link} to="/forum" color="inherit">
            {t('navigation.forum')}
          </Button>
          
          <LanguageSwitcher />
          
          {currentUser ? (
            <>
              <IconButton 
                color="inherit"
                onClick={handleMenuOpen}
              >
                {currentUser.profileImage ? (
                  <Avatar 
                    src={currentUser.profileImage} 
                    alt={currentUser.name} 
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircleIcon />
                )}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                  {t('navigation.profile')}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  {t('navigation.logout')}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box>
              <Button component={Link} to="/login" color="inherit">
                {t('navigation.login')}
              </Button>
              <Button component={Link} to="/register" color="inherit">
                {t('navigation.register')}
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}