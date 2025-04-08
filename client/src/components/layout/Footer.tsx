import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 3, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('appName')} - {t('appFullName')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} {t('appName')}
          </Typography>
          
          <Box>
            <Link href="#" color="inherit" sx={{ mx: 1 }}>
              {t('footer.aboutUs')}
            </Link>
            <Link href="#" color="inherit" sx={{ mx: 1 }}>
              {t('footer.contactUs')}
            </Link>
            <Link href="#" color="inherit" sx={{ mx: 1 }}>
              {t('footer.privacyPolicy')}
            </Link>
            <Link href="#" color="inherit" sx={{ mx: 1 }}>
              {t('footer.termsOfService')}
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}