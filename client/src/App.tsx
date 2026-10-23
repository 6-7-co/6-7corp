import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollProgress } from './components/ScrollProgress';
import { ContentProvider } from './context/ContentContext';
import { Home } from './pages/Home';
import { ProjectDetail } from './pages/ProjectDetail';
import { Journal } from './pages/Journal';
import { PostDetail } from './pages/PostDetail';
import { Contact } from './pages/Contact';
import { NotFound } from './pages/NotFound';
import { AdminApp } from './components/admin/AdminApp';
import { AdminDashboard } from './components/admin/AdminDashboard';

// Admin pages are heavier — code-split them.
const AdminPosts = lazy(() => import('./components/admin/AdminPosts').then((m) => ({ default: m.AdminPosts })));
const AdminProjects = lazy(() => import('./components/admin/AdminProjects').then((m) => ({ default: m.AdminProjects })));
const AdminTeam = lazy(() => import('./components/admin/AdminTeam').then((m) => ({ default: m.AdminTeam })));
const AdminSettings = lazy(() => import('./components/admin/AdminSettings').then((m) => ({ default: m.AdminSettings })));
const AdminMessages = lazy(() => import('./components/admin/AdminMessages').then((m) => ({ default: m.AdminMessages })));
const AdminMedia = lazy(() => import('./components/admin/AdminMedia').then((m) => ({ default: m.AdminMedia })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="grain" />
      <div className="scanlines" />
      <ScrollProgress />
      <Navbar />
      <main className="relative z-10">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  const location = useLocation();
  // Key by top-level segment so admin sub-routes don't remount the shell.
  const segmentKey = location.pathname.split('/')[1] || 'home';

  return (
    <ContentProvider>
      <Layout>
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <motion.div
            key={segmentKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense
              fallback={
                <div className="grid min-h-[60vh] place-items-center">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Loading…</span>
                </div>
              }
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/work/:slug" element={<ProjectDetail />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/journal/:slug" element={<PostDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<AdminApp />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="posts" element={<AdminPosts />} />
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path="team" element={<AdminTeam />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="media" element={<AdminMedia />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </Layout>
    </ContentProvider>
  );
}
