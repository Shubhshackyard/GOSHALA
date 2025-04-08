import './App.css'
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lazy, Suspense } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
const HomePage = lazy(() => import('./pages/HomePage'));
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ForumPage from './pages/ForumPage';
import MarketplacePage from './pages/MarketplacePage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import EditPostPage from './pages/EditPostPage';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green shade for agricultural theme
    },
    secondary: {
      main: '#ffa000', // Amber for contrast
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Header />
            <main className="main-content" style={{ minHeight: 'calc(100vh - 130px)', padding: '20px 0' }}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Suspense fallback={<CircularProgress />}>
                      <HomePage />
                    </Suspense>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/forum" element={<ForumPage />} />
                <Route path="/forum/create" element={<CreatePostPage />} />
                <Route path="/forum/posts/:id" element={<PostDetailPage />} />
                <Route path="/forum/edit/:id" element={<EditPostPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
