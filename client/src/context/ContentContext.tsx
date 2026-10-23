import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';

export type Project = {
  id: number;
  title: string;
  slug: string;
  client: string;
  year: string;
  tags: string;
  excerpt: string;
  cover: string | null;
  link: string | null;
  order_idx: number;
  created_at: string;
  body_md?: string;
};

export type TeamMember = {
  id: number;
  name: string;
  role: string;
  bio: string;
  photo: string | null;
  socials: Record<string, string>;
  order_idx: number;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover: string | null;
  published: number;
  created_at: string;
  updated_at: string;
};

export type Settings = {
  company_name: string;
  tagline: string;
  description: string;
  email: string;
  established: string;
  locale_default: string;
};

type Content = {
  settings: Settings;
  projects: Project[];
  team: TeamMember[];
  posts: Post[];
  loading: boolean;
  reload: () => void;
};

const ContentContext = createContext<Content | null>(null);

const FALLBACK_SETTINGS: Settings = {
  company_name: '6-7 Corporation',
  tagline: '',
  description: '',
  email: 'hello@6-7corp.com',
  established: '2019',
  locale_default: 'en',
};

export function ContentProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(FALLBACK_SETTINGS);
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [s, p, m, posts] = await Promise.all([
        api.get<Settings>('/api/settings'),
        api.get<Project[]>('/api/projects'),
        api.get<TeamMember[]>('/api/team'),
        api.get<Post[]>('/api/posts'),
      ]);
      setSettings({ ...FALLBACK_SETTINGS, ...s });
      setProjects(p);
      setTeam(m.map((x) => ({ ...x, socials: typeof x.socials === 'string' ? safeParse(x.socials) : x.socials })));
      setPosts(posts);
    } catch {
      /* keep fallbacks */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ContentContext.Provider value={{ settings, projects, team, posts, loading, reload: load }}>
      {children}
    </ContentContext.Provider>
  );
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
}
