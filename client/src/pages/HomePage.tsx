import { Container, Typography, Box, Button, Card, CardContent, CardMedia } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import directProducerImg from '../assets/images/direct-producers.jpg';
import communityKnowledgeImg from '../assets/images/community-knowledge.jpg';
import supportLocalImg from '../assets/images/support-local.jpg';

export default function HomePage() {
  const { t } = useTranslation('home');
  
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        sx={{ 
          textAlign: 'center', 
          py: 8,
          background: 'linear-gradient(rgba(46, 125, 50, 0.1), rgba(46, 125, 50, 0.05))',
          borderRadius: 2,
          mb: 6
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          {t('title')}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {t('subtitle')}
        </Typography>
        <Typography variant="h5" color="text.secondary" component="p" sx={{ mt: 2, mb: 2 }}>
          {t('description')}
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button 
            component={Link} 
            to="/marketplace" 
            variant="contained" 
            color="primary" 
            size="large" 
            sx={{ mx: 1 }}
          >
            {t('buttons.exploreProducts')}
          </Button>
          <Button 
            component={Link} 
            to="/forum" 
            variant="outlined" 
            color="primary" 
            size="large" 
            sx={{ mx: 1 }}
          >
            {t('buttons.joinCommunity')}
          </Button>
        </Box>
      </Box>
      
      {/* Features Section */}
      <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
        {t('features.title')}
      </Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs:12, md:4}}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image={directProducerImg}
              alt={t('features.directFromProducers.title')}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom>
                {t('features.directFromProducers.title')}
              </Typography>
              <Typography>
                {t('features.directFromProducers.description')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs:12, md:4}}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image={communityKnowledgeImg}
              alt={t('features.communityKnowledge.title')}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom>
                {t('features.communityKnowledge.title')}
              </Typography>
              <Typography>
                {t('features.communityKnowledge.description')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs:12, md:4}}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image={supportLocalImg}
              alt={t('features.supportLocal.title')}
              sx={{ objectFit: 'cover' }}
          />  
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom>
                {t('features.supportLocal.title')}
              </Typography>
              <Typography>
                {t('features.supportLocal.description')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Testimonials Section */}
      <Box sx={{ my: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          {t('testimonials.title')}
        </Typography>
        {/* Testimonial cards */}
      </Box>

      {/* Call to Action */}
      <Box sx={{ my: 8, textAlign: 'center', py: 6, bgcolor: 'primary.light', borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {t('cta.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('cta.description')}
        </Typography>
        <Button
          component={Link}
          to="/register"
          variant="contained"
          color="primary"
          size="large"
        >
          {t('cta.button')}
        </Button>
      </Box>
    </Container>
  );
}
