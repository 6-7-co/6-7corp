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
import { ADMIN_ENABLED, ADMIN_PATH } from './lib/adminRoute';
import { hashId, scrollToSectionWhenReady } from './lib/scroll';

// Admin pages are heavier — code-split them.
const AdminPosts = lazy(() => import('./components/admin/AdminPosts').then((m) => ({ default: m.AdminPosts })));
const AdminProjects = lazy(() => import('./components/admin/AdminProjects').then((m) => ({ default: m.AdminProjects })));
const AdminTeam = lazy(() => import('./components/admin/AdminTeam').then((m) => ({ default: m.AdminTeam })));
const AdminSettings = lazy(() => import('./components/admin/AdminSettings').then((m) => ({ default: m.AdminSettings })));
const AdminMessages = lazy(() => import('./components/admin/AdminMessages').then((m) => ({ default: m.AdminMessages })));
const AdminMedia = lazy(() => import('./components/admin/AdminMedia').then((m) => ({ default: m.AdminMedia })));

function PageLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">…</span>
    </div>
  );
}

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hashId(hash);
      if (id === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      scrollToSectionWhenReady(id);
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="relative z-10">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin =
    ADMIN_ENABLED &&
    (location.pathname === `/${ADMIN_PATH}` || location.pathname.startsWith(`/${ADMIN_PATH}/`));
  const segmentKey = location.pathname.split('/')[1] || 'home';

  return (
    <ContentProvider>
      {isAdmin ? (
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path={`/${ADMIN_PATH}`} element={<AdminApp />}>
              <Route index element={<AdminDashboard />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="team" element={<AdminTeam />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="*" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Suspense>
      ) : (
        <Layout>
          <ScrollManager />
          <AnimatePresence mode="wait">
            <motion.div
              key={segmentKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <Suspense fallback={<PageLoader />}>
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/work/:slug" element={<ProjectDetail />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/journal/:slug" element={<PostDetail />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </Layout>
      )}
    </ContentProvider>
  );
}
