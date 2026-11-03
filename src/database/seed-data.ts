// Temporary placeholder data for the test assignment; replace before submission.
export interface SeedSkill {
  name: string;
  category: string;
  level: number;
}

export interface SeedExperience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  achievements: string[];
}

export interface SeedProject {
  name: string;
  description: string;
  url: string | null;
  repositoryUrl: string;
  technologies: string[];
}

export interface SeedProfile {
  slug: string;
  name: string;
  title: string;
  description: string;
  email: string;
  location: string;
  githubUrl: string;
  linkedinUrl: string;
  skills: SeedSkill[];
  experience: SeedExperience[];
  projects: SeedProject[];
}

export const seedData: SeedProfile = {
  slug: 'ksenia-lugovaa',
  name: 'Ksenia Lugovaa',
  title: 'TypeScript Backend Developer',
  description:
    'Backend-разработчик, проектирую API на NestJS, PostgreSQL и GraphQL. ' +
    'Фокус на чистой архитектуре, типизации и производительности запросов к данным.',
  email: 'ksenia@example.com',
  location: 'Remote',
  githubUrl: 'https://github.com/example',
  linkedinUrl: 'https://www.linkedin.com/in/example',
  skills: [
    { name: 'TypeScript', category: 'Languages', level: 5 },
    { name: 'Node.js', category: 'Backend', level: 5 },
    { name: 'NestJS', category: 'Backend', level: 4 },
    { name: 'PostgreSQL', category: 'Databases', level: 4 },
    { name: 'Prisma', category: 'Databases', level: 4 },
    { name: 'GraphQL', category: 'API', level: 4 },
    { name: 'Docker', category: 'DevOps', level: 3 },
    { name: 'Git', category: 'Tools', level: 5 },
  ],
  experience: [
    {
      company: 'Acme Fintech',
      position: 'Backend Developer',
      location: 'Remote',
      startDate: '2023-01-01',
      endDate: null,
      description:
        'Разработка платёжного API на NestJS и PostgreSQL, интеграции с внешними сервисами.',
      achievements: [
        'Спроектировала GraphQL-слой и устранила N+1 в вложенных запросах через DataLoader',
        'Сократила время ответа ключевых запросов на 40% за счёт индексов и батчинга',
        'Настроила миграции Prisma и автоматический деплой в Docker',
      ],
    },
    {
      company: 'Studio Web',
      position: 'Junior Backend Developer',
      location: 'Remote',
      startDate: '2021-06-01',
      endDate: '2022-12-31',
      description: 'Разработка внутренних сервисов и REST API для клиентских проектов.',
      achievements: [
        'Внедрила типизированный слой доступа к данным на Prisma',
        'Покрыла критические сценарии API интеграционными тестами',
      ],
    },
  ],
  projects: [
    {
      name: 'Business Card API',
      description:
        'Backend цифровой визитки на NestJS, Prisma, PostgreSQL и GraphQL с Apollo Sandbox.',
      url: null,
      repositoryUrl: 'https://github.com/example/business-card',
      technologies: ['NestJS', 'Prisma', 'GraphQL', 'PostgreSQL', 'Docker'],
    },
    {
      name: 'Notes API',
      description: 'Сервис заметок с версионированием и оптимистичными блокировками.',
      url: 'https://example.com/notes',
      repositoryUrl: 'https://github.com/example/notes-api',
      technologies: ['TypeScript', 'Node.js', 'PostgreSQL'],
    },
  ],
};
