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

export type StatItem = { value: string; label_ru: string; label_en: string };

export type Settings = {
  company_name: string;
  email: string;
  established: string;
  locale_default: string;
  telegram: string;
  github: string;
  /** Companies shown under the hero. */
  clients: string[];
  /** Numbers in the card under the hero. */
  stats: StatItem[];
  tagline_ru: string;
  tagline_en: string;
  description_ru: string;
  description_en: string;
  location_ru: string;
  location_en: string;
  hero_eyebrow_ru: string;
  hero_eyebrow_en: string;
  hero_line1_ru: string;
  hero_line1_en: string;
  hero_line2_ru: string;
  hero_line2_en: string;
  hero_line3_ru: string;
  hero_line3_en: string;
  hero_description_ru: string;
  hero_description_en: string;
  hero_trusted_ru: string;
  hero_trusted_en: string;
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
  email: 'hello@6-7corp.com',
  established: '2019',
  locale_default: 'ru',
  telegram: '',
  github: 'https://github.com/6-7-co',
  clients: [],
  stats: [],
  tagline_ru: '',
  tagline_en: '',
  description_ru: '',
  description_en: '',
  location_ru: 'Стокгольм · удалённо',
  location_en: 'Stockholm · remote',
  hero_eyebrow_ru: '',
  hero_eyebrow_en: '',
  hero_line1_ru: '',
  hero_line1_en: '',
  hero_line2_ru: '',
  hero_line2_en: '',
  hero_line3_ru: '',
  hero_line3_en: '',
  hero_description_ru: '',
  hero_description_en: '',
  hero_trusted_ru: '',
  hero_trusted_en: '',
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
      setSettings({
        ...FALLBACK_SETTINGS,
        ...s,
        clients: Array.isArray(s.clients) ? s.clients : [],
        stats: Array.isArray(s.stats) ? s.stats : [],
      });
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
