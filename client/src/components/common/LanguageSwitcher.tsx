import { useState } from 'react';
import { 
  Button, Menu, MenuItem, Typography, 
  ListItemIcon, ListItemText 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
];

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    handleClose();
  };
  
  // Find current language
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  return (
    <>
      <Button
        color="inherit"
        onClick={handleClick}
        startIcon={<TranslateIcon />}
      >
        {currentLanguage.nativeName}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            minWidth: '200px',
          }
        }}
      >
        <Typography variant="subtitle2" color="textSecondary" sx={{ px: 2, py: 1 }}>
          {t('selectLanguage')}
        </Typography>
        {languages.map((language) => (
          <MenuItem 
            key={language.code} 
            onClick={() => changeLanguage(language.code)}
            selected={i18n.language === language.code}
          >
            <ListItemText 
              primary={language.nativeName} 
              secondary={language.name !== language.nativeName ? language.name : undefined} 
            />
            {i18n.language === language.code && (
              <ListItemIcon sx={{ justifyContent: 'flex-end' }}>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}