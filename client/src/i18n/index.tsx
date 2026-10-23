import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { makeTranslator } from './translate';

export type Lang = 'en' | 'ru';

export const LANGS: { id: Lang; label: string; short: string }[] = [
  { id: 'ru', label: 'Русский', short: 'RU' },
  { id: 'en', label: 'English', short: 'EN' },
];

type Dict = Record<string, string>;

const ru: Dict = {
  'nav.services': 'Направления',
  'nav.projects': 'Работы',
  'nav.team': 'Команда',
  'nav.journal': 'Журнал',
  'nav.contact': 'Контакты',
  'nav.cta': 'Обсудить проект',
  'common.all': 'Все работы',
  'common.readAll': 'Все записи',
  'common.more': 'Подробнее',
  'common.back': 'Назад',
  'common.loading': 'Загрузка',
  'common.empty': 'Здесь пока пусто.',
  'common.save': 'Сохранить',
  'common.cancel': 'Отмена',
  'common.delete': 'Удалить',
  'common.edit': 'Изменить',
  'common.add': 'Добавить',
  'common.confirmDelete': 'Удалить? Действие необратимо.',
  'lang.label': 'Язык',
  'theme.toLight': 'Светлая тема',
  'theme.toDark': 'Тёмная тема',
  'contact.name': 'Имя',
  'contact.email': 'Email',
  'contact.message': 'Сообщение',
  'contact.send': 'Отправить сообщение',
  'contact.sent': 'Сообщение отправлено — спасибо!',
  'contact.translating': 'Переводим…',
  'contact.namePh': 'Как к вам обращаться',
  'contact.emailPh': 'you@company.com',
  'contact.messagePh': 'Пару слов о задаче, сроках и команде…',
  'contact.error': 'Что-то пошло не так. Попробуйте ещё раз.',
  'footer.nav': 'Навигация',
  'footer.contacts': 'Контакты',
  'footer.rights': 'Все права защищены.',
  'footer.admin': 'Панель',
  'admin.login': 'Вход в панель',
  'admin.username': 'Логин',
  'admin.password': 'Пароль',
  'admin.signin': 'Войти',
  'admin.signout': 'Выйти',
  'admin.dashboard': 'Обзор',
  'admin.posts': 'Журнал',
  'admin.projects': 'Проекты',
  'admin.team': 'Команда',
  'admin.settings': 'Настройки',
  'admin.messages': 'Сообщения',
  'admin.media': 'Медиа',
  'admin.new': 'Создать',
  'admin.title': 'Заголовок',
  'admin.slug': 'Slug',
  'admin.excerpt': 'Краткое описание',
  'admin.body': 'Текст (Markdown)',
  'admin.cover': 'Обложка',
  'admin.client': 'Клиент',
  'admin.year': 'Год',
  'admin.tags': 'Теги',
  'admin.link': 'Ссылка',
  'admin.role': 'Роль',
  'admin.bio': 'О себе',
  'admin.photo': 'Фото',
  'admin.order': 'Порядок',
  'admin.publish': 'Опубликовано',
  'admin.draft': 'Черновик',
  'admin.preview': 'Предпросмотр',
  'admin.saved': 'Сохранено',
  'admin.name': 'Имя',
  'admin.email': 'Email',
  'admin.toSite': 'На сайт',
};

const en: Dict = {
  'nav.services': 'Services',
  'nav.projects': 'Work',
  'nav.team': 'Team',
  'nav.journal': 'Journal',
  'nav.contact': 'Contact',
  'nav.cta': 'Start a project',
  'common.all': 'All work',
  'common.readAll': 'All notes',
  'common.more': 'Read more',
  'common.back': 'Back',
  'common.loading': 'Loading',
  'common.empty': 'Nothing here yet.',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.add': 'Add',
  'common.confirmDelete': 'Delete this item? This cannot be undone.',
  'lang.label': 'Language',
  'theme.toLight': 'Light theme',
  'theme.toDark': 'Dark theme',
  'contact.name': 'Name',
  'contact.email': 'Email',
  'contact.message': 'Message',
  'contact.send': 'Send message',
  'contact.sent': 'Message sent — thank you!',
  'contact.translating': 'Translating…',
  'contact.namePh': 'How should we address you',
  'contact.emailPh': 'you@company.com',
  'contact.messagePh': 'A few words about the task, timeline and team…',
  'contact.error': 'Something went wrong. Please try again.',
  'footer.nav': 'Navigation',
  'footer.contacts': 'Contacts',
  'footer.rights': 'All rights reserved.',
  'footer.admin': 'Panel',
  'admin.login': 'Admin sign in',
  'admin.username': 'Username',
  'admin.password': 'Password',
  'admin.signin': 'Sign in',
  'admin.signout': 'Sign out',
  'admin.dashboard': 'Overview',
  'admin.posts': 'Journal',
  'admin.projects': 'Projects',
  'admin.team': 'Team',
  'admin.settings': 'Settings',
  'admin.messages': 'Messages',
  'admin.media': 'Media',
  'admin.new': 'New',
  'admin.title': 'Title',
  'admin.slug': 'Slug',
  'admin.excerpt': 'Excerpt',
  'admin.body': 'Body (Markdown)',
  'admin.cover': 'Cover image',
  'admin.client': 'Client',
  'admin.year': 'Year',
  'admin.tags': 'Tags',
  'admin.link': 'Link',
  'admin.role': 'Role',
  'admin.bio': 'Bio',
  'admin.photo': 'Photo',
  'admin.order': 'Order',
  'admin.publish': 'Published',
  'admin.draft': 'Draft',
  'admin.preview': 'Preview',
  'admin.saved': 'Saved',
  'admin.name': 'Name',
  'admin.email': 'Email',
  'admin.toSite': 'View site',
};

const DICTS: Record<Lang, Dict> = { ru, en };

/** Localised pair of strings/content. */
export type Localized<T = string> = Record<Lang, T>;

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  /** Pick the current language from a localized value. */
  pick: <T>(value: Localized<T>) => T;
  /** Translate arbitrary text to the current language via Google. */
  translate: (text: string) => Promise<string>;
};

const I18nContext = createContext<I18nValue | null>(null);

function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem('corp_lang');
    if (stored === 'en' || stored === 'ru') return stored;
  } catch {
    /* ignore */
  }
  return (navigator.language || 'en').toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

const translateCached = makeTranslator('corp');

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('corp_lang', l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: string) => DICTS[lang][key] ?? DICTS.ru[key] ?? key, [lang]);

  const pick = useCallback(<T,>(value: Localized<T>) => value[lang] ?? value.ru, [lang]);

  const translate = useCallback((text: string) => translateCached(text, lang), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, pick, translate }), [lang, setLang, t, pick, translate]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
