# R&D MCP/Skill 큐레이션 사이트 MVP 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 국내 R&D 연구자를 위한 MCP/Skill 큐레이션 정적 웹사이트 MVP 배포

**Architecture:** Astro 5 정적 사이트. 콘텐츠는 JSON + MDX로 관리하고 Content Collections + Zod로 빌드 타임 검증. Pagefind로 한국어 검색, Tailwind CSS 4로 스타일링, GitHub Pages로 배포.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS 4, Pagefind, Zod, pnpm, GitHub Actions

---

## File Structure

### 신규 생성 파일

```
rndskills/
├── package.json
├── pnpm-lock.yaml
├── astro.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── content.config.ts                    # Zod 스키마 정의
├── src/
│   ├── pages/
│   │   ├── index.astro                  # 홈페이지
│   │   ├── about.astro                  # 소개 페이지
│   │   ├── faq.astro                    # FAQ 페이지
│   │   ├── search.astro                 # 통합 검색
│   │   ├── mcps/
│   │   │   ├── index.astro              # MCP 목록
│   │   │   └── [id].astro              # MCP 상세
│   │   ├── skills/
│   │   │   ├── index.astro              # Skill 목록
│   │   │   └── [id].astro              # Skill 상세
│   │   ├── domains/
│   │   │   └── [id].astro              # 도메인별 랜딩
│   │   ├── guides/
│   │   │   ├── index.astro              # 가이드 목록
│   │   │   └── [id].astro              # 가이드 상세
│   │   ├── cases/
│   │   │   └── index.astro              # 사례 목록
│   │   └── rss.xml.ts                   # RSS 피드
│   ├── components/
│   │   ├── Header.astro                 # 네비게이션 헤더
│   │   ├── Footer.astro                 # 푸터
│   │   ├── Card.astro                   # 콘텐츠 카드
│   │   ├── DomainGrid.astro             # 도메인 아이콘 그리드
│   │   ├── DomainFilter.astro           # 도메인 필터 UI
│   │   ├── TagList.astro                # 태그 목록
│   │   ├── CopyButton.astro             # 설치 명령어 복사
│   │   ├── HeroExplainer.astro          # 홈 히어로 + MCP 설명
│   │   └── SearchWidget.astro           # Pagefind 검색 위젯
│   ├── layouts/
│   │   ├── BaseLayout.astro             # HTML 기본 레이아웃 + SEO
│   │   ├── ListLayout.astro             # 목록 페이지 레이아웃
│   │   └── DetailLayout.astro           # 상세 페이지 레이아웃
│   └── utils/
│       └── domains.ts                   # 도메인 데이터 로딩 유틸
├── content/
│   ├── domains.json                     # 도메인 정의
│   ├── mcps/
│   │   ├── korean-law.json
│   │   ├── korean-law.mdx
│   │   ├── kisti-vectordb.json
│   │   └── kisti-vectordb.mdx
│   ├── skills/
│   │   ├── omc-ultrawork.json
│   │   └── omc-ultrawork.mdx
│   ├── guides/
│   │   ├── what-is-mcp.json
│   │   └── what-is-mcp.mdx
│   └── cases/
│       └── korean-law-research.json
├── public/
│   ├── favicon.svg
│   └── robots.txt
└── .github/
    ├── ISSUE_TEMPLATE/
    │   └── new-mcp-submission.yml
    └── workflows/
        └── deploy.yml
```

---

## Task 1: Astro 프로젝트 스캐폴딩

**Files:**
- Create: `package.json`, `astro.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Create: `src/pages/index.astro` (placeholder)

- [ ] **Step 1: Astro 프로젝트 생성**

```bash
cd /Users/junehawk/Research/rndskills
pnpm create astro@latest . --template minimal --typescript strict --install --no-git
```

옵션에서 TypeScript strict, 의존성 설치 선택. `--no-git`은 이미 git init 했으므로.

- [ ] **Step 2: Tailwind CSS 통합 추가**

```bash
cd /Users/junehawk/Research/rndskills
pnpm astro add tailwind
```

프롬프트에서 모두 Yes 선택.

- [ ] **Step 3: 추가 의존성 설치**

```bash
cd /Users/junehawk/Research/rndskills
pnpm add @astrojs/rss @astrojs/sitemap @astrojs/mdx
```

- [ ] **Step 4: astro.config.ts 설정**

`astro.config.ts`를 다음으로 교체:

```typescript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://junehawk.github.io',
  base: '/rndskills',
  integrations: [tailwind(), mdx(), sitemap()],
  output: 'static',
});
```

- [ ] **Step 5: 개발 서버 확인**

```bash
cd /Users/junehawk/Research/rndskills
pnpm dev
```

Expected: `localhost:4321`에서 기본 Astro 페이지 표시.

- [ ] **Step 6: 커밋**

```bash
cd /Users/junehawk/Research/rndskills
git add package.json pnpm-lock.yaml astro.config.ts tailwind.config.ts tsconfig.json src/ public/ .gitignore CLAUDE.md docs/
git commit -m "feat: Astro 프로젝트 스캐폴딩 + Tailwind + MDX + Sitemap"
```

---

## Task 2: Content Collections 스키마 정의

**Files:**
- Create: `content.config.ts`
- Create: `content/domains.json`
- Create: `src/utils/domains.ts`

- [ ] **Step 1: content.config.ts 작성**

```typescript
import { defineCollection, z } from 'astro:content';

const mcps = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    benefits: z.string(),
    author: z.string(),
    repository: z.string().url(),
    version: z.string(),
    license: z.string(),
    pricing: z.enum(['free', 'freemium', 'paid']),
    prerequisites: z.array(z.string()),
    category: z.literal('mcp'),
    domains: z.array(z.string()),
    tags: z.array(z.string()),
    tools: z.array(z.string()),
    status: z.enum(['active', 'deprecated', 'beta']),
    installMethod: z.string(),
    installCommand: z.string(),
    compatibility: z.array(z.string()),
    featured: z.boolean().default(false),
    addedAt: z.string(),
    updatedAt: z.string(),
    cases: z.array(z.string()).default([]),
  }),
});

const skills = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    benefits: z.string(),
    author: z.string(),
    repository: z.string().url(),
    version: z.string(),
    license: z.string(),
    pricing: z.enum(['free', 'freemium', 'paid']),
    prerequisites: z.array(z.string()),
    category: z.literal('skill'),
    domains: z.array(z.string()),
    tags: z.array(z.string()),
    platform: z.string(),
    installMethod: z.string(),
    installCommand: z.string(),
    status: z.enum(['active', 'deprecated', 'beta']),
    featured: z.boolean().default(false),
    addedAt: z.string(),
    cases: z.array(z.string()).default([]),
  }),
});

const guides = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    tags: z.array(z.string()),
    order: z.number(),
    addedAt: z.string(),
  }),
});

const cases = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(['blog', 'video', 'paper', 'tutorial']),
    url: z.string().url(),
    author: z.string(),
    relatedItems: z.array(z.string()),
    language: z.string().default('ko'),
    addedAt: z.string(),
  }),
});

export const collections = { mcps, skills, guides, cases };
```

- [ ] **Step 2: content/domains.json 작성**

```json
[
  {
    "id": "law-policy",
    "name": "법률/정책",
    "icon": "scale",
    "color": "#3B82F6",
    "description": "법령, 판례, 행정해석, 정책 관련 AI 도구",
    "priority": 1,
    "status": "active"
  },
  {
    "id": "public-data",
    "name": "공공데이터",
    "icon": "database",
    "color": "#10B981",
    "description": "공공데이터포털, 통계청, 정부 API 연계 도구",
    "priority": 2,
    "status": "active"
  },
  {
    "id": "academic",
    "name": "학술/논문",
    "icon": "book-open",
    "color": "#8B5CF6",
    "description": "논문 검색, 학술 DB, 문헌 분석 도구",
    "priority": 3,
    "status": "active"
  },
  {
    "id": "research-admin",
    "name": "과제관리/연구행정",
    "icon": "clipboard-list",
    "color": "#F59E0B",
    "description": "NTIS, 연구비 정산, 성과 보고서, 과제 관리 도구",
    "priority": 4,
    "status": "active"
  },
  {
    "id": "dev-tools",
    "name": "개발도구",
    "icon": "wrench",
    "color": "#6366F1",
    "description": "코드 작성, 디버깅, 개발 생산성 도구",
    "priority": 5,
    "status": "upcoming"
  },
  {
    "id": "bio-medical",
    "name": "바이오/의료",
    "icon": "heart-pulse",
    "color": "#EF4444",
    "description": "생명과학, 의료, 바이오인포매틱스 도구",
    "priority": 6,
    "status": "upcoming"
  },
  {
    "id": "materials",
    "name": "재료/화학",
    "icon": "flask",
    "color": "#06B6D4",
    "description": "재료과학, 화학, 소재 분석 도구",
    "priority": 7,
    "status": "upcoming"
  },
  {
    "id": "environment",
    "name": "환경/에너지",
    "icon": "leaf",
    "color": "#22C55E",
    "description": "환경 데이터, 에너지, 기후 관련 도구",
    "priority": 8,
    "status": "upcoming"
  },
  {
    "id": "patent",
    "name": "특허/지재권",
    "icon": "file-badge",
    "color": "#A855F7",
    "description": "KIPRIS, 특허 검색, 지적재산권 분석 도구",
    "priority": 9,
    "status": "upcoming"
  },
  {
    "id": "automation",
    "name": "자동화",
    "icon": "bot",
    "color": "#64748B",
    "description": "워크플로우 자동화, 반복 작업 효율화 도구",
    "priority": 10,
    "status": "upcoming"
  },
  {
    "id": "data-analysis",
    "name": "데이터분석",
    "icon": "bar-chart",
    "color": "#EC4899",
    "description": "데이터 분석, 시각화, 통계 처리 도구",
    "priority": 11,
    "status": "upcoming"
  }
]
```

- [ ] **Step 3: src/utils/domains.ts 작성**

```typescript
import domainsData from '../../content/domains.json';

export interface Domain {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  priority: number;
  status: 'active' | 'upcoming';
}

export const domains: Domain[] = domainsData as Domain[];

export function getDomain(id: string): Domain | undefined {
  return domains.find((d) => d.id === id);
}

export function getActiveDomains(): Domain[] {
  return domains.filter((d) => d.status === 'active').sort((a, b) => a.priority - b.priority);
}

export function getAllDomains(): Domain[] {
  return [...domains].sort((a, b) => a.priority - b.priority);
}
```

- [ ] **Step 4: 빌드 검증**

```bash
cd /Users/junehawk/Research/rndskills
pnpm build
```

Expected: 빌드 성공 (콘텐츠 폴더가 비어 있으면 경고가 나올 수 있지만 에러는 아님).

- [ ] **Step 5: 커밋**

```bash
cd /Users/junehawk/Research/rndskills
git add content.config.ts content/domains.json src/utils/domains.ts
git commit -m "feat: Content Collections Zod 스키마 + 도메인 정의"
```

---

## Task 3: BaseLayout + Header + Footer

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `public/favicon.svg`

- [ ] **Step 1: public/favicon.svg 생성**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#3B82F6"/>
  <text x="16" y="22" font-size="18" font-family="system-ui" font-weight="bold" fill="white" text-anchor="middle">R</text>
</svg>
```

- [ ] **Step 2: src/layouts/BaseLayout.astro 작성**

```astro
---
interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const { title, description = '국내 R&D 연구자를 위한 MCP 서버 및 AI Skill 큐레이션', ogImage } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const siteName = 'R&D MCP Hub';
const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
---

<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <meta name="generator" content={Astro.generator} />
    <link rel="icon" type="image/svg+xml" href={`${import.meta.env.BASE_URL}favicon.svg`} />
    <link rel="sitemap" href={`${import.meta.env.BASE_URL}sitemap-index.xml`} />
    <link rel="alternate" type="application/rss+xml" title={siteName} href={`${import.meta.env.BASE_URL}rss.xml`} />
    <link rel="canonical" href={canonicalURL} />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    {ogImage && <meta property="og:image" content={ogImage} />}
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content={siteName} />

    <title>{fullTitle}</title>
  </head>
  <body class="min-h-screen flex flex-col bg-gray-50 text-gray-900">
    <Header />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  </body>
</html>

<script>
  // Pagefind UI 로드 (검색 페이지에서 사용)
</script>
```

`BaseLayout.astro` 상단에 import 추가:

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
// ... rest of frontmatter
---
```

- [ ] **Step 3: src/components/Header.astro 작성**

```astro
---
const navItems = [
  { label: '시작하기', href: `${import.meta.env.BASE_URL}guides/` },
  { label: 'MCP서버', href: `${import.meta.env.BASE_URL}mcps/` },
  { label: 'Skills', href: `${import.meta.env.BASE_URL}skills/` },
  { label: '사례', href: `${import.meta.env.BASE_URL}cases/` },
  { label: 'FAQ', href: `${import.meta.env.BASE_URL}faq/` },
];
const currentPath = Astro.url.pathname;
---

<header class="bg-white border-b border-gray-200 sticky top-0 z-50">
  <nav class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
    <a href={import.meta.env.BASE_URL} class="flex items-center gap-2 font-bold text-xl text-blue-600">
      <span>R&D MCP Hub</span>
    </a>

    <div class="hidden md:flex items-center gap-6">
      {navItems.map(({ label, href }) => (
        <a
          href={href}
          class:list={[
            'text-sm font-medium transition-colors hover:text-blue-600',
            currentPath.startsWith(href) ? 'text-blue-600' : 'text-gray-600',
          ]}
        >
          {label}
        </a>
      ))}
      <a
        href={`${import.meta.env.BASE_URL}search/`}
        class="text-gray-500 hover:text-blue-600 transition-colors"
        aria-label="검색"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </a>
    </div>

    <!-- Mobile menu button -->
    <button id="mobile-menu-btn" class="md:hidden p-2 text-gray-600" aria-label="메뉴">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  </nav>

  <!-- Mobile menu -->
  <div id="mobile-menu" class="hidden md:hidden border-t border-gray-200 bg-white">
    <div class="px-4 py-3 space-y-2">
      {navItems.map(({ label, href }) => (
        <a href={href} class="block py-2 text-sm text-gray-600 hover:text-blue-600">
          {label}
        </a>
      ))}
      <a href={`${import.meta.env.BASE_URL}search/`} class="block py-2 text-sm text-gray-600 hover:text-blue-600">
        검색
      </a>
    </div>
  </div>
</header>

<script>
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  btn?.addEventListener('click', () => menu?.classList.toggle('hidden'));
</script>
```

- [ ] **Step 4: src/components/Footer.astro 작성**

```astro
---
const year = new Date().getFullYear();
---

<footer class="bg-gray-900 text-gray-400 mt-auto">
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="text-sm">
        &copy; {year} R&D MCP Hub. 국내 R&D 커뮤니티를 위한 AI 도구 큐레이션.
      </div>
      <div class="flex gap-4 text-sm">
        <a href={`${import.meta.env.BASE_URL}about/`} class="hover:text-white transition-colors">소개</a>
        <a href={`${import.meta.env.BASE_URL}rss.xml`} class="hover:text-white transition-colors">RSS</a>
        <a href="https://github.com/junehawk/rndskills" class="hover:text-white transition-colors" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>
  </div>
</footer>
```

- [ ] **Step 5: index.astro를 BaseLayout으로 감싸서 테스트**

`src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="R&D MCP Hub">
  <div class="max-w-6xl mx-auto px-4 py-16 text-center">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">R&D MCP Hub</h1>
    <p class="text-lg text-gray-600">국내 R&D를 위한 AI 도구 확장 모음 — 준비 중</p>
  </div>
</BaseLayout>
```

- [ ] **Step 6: 개발 서버에서 확인**

```bash
cd /Users/junehawk/Research/rndskills
pnpm dev
```

Expected: 헤더 + 메인 콘텐츠 + 푸터가 표시됨. 모바일 메뉴 토글 동작.

- [ ] **Step 7: 커밋**

```bash
cd /Users/junehawk/Research/rndskills
git add src/layouts/ src/components/Header.astro src/components/Footer.astro src/pages/index.astro public/favicon.svg
git commit -m "feat: BaseLayout + Header + Footer 컴포넌트"
```

---

## Task 4: 공통 UI 컴포넌트

**Files:**
- Create: `src/components/Card.astro`
- Create: `src/components/DomainGrid.astro`
- Create: `src/components/DomainFilter.astro`
- Create: `src/components/TagList.astro`
- Create: `src/components/CopyButton.astro`

- [ ] **Step 1: src/components/Card.astro 작성**

```astro
---
interface Props {
  title: string;
  description: string;
  benefits?: string;
  href: string;
  domains?: string[];
  tags?: string[];
  pricing?: string;
  status?: string;
}

import { getDomain } from '../utils/domains';

const { title, description, benefits, href, domains = [], tags = [], pricing, status } = Astro.props;
---

<a href={href} class="block bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all">
  <div class="flex items-start justify-between gap-2 mb-2">
    <h3 class="font-semibold text-gray-900 line-clamp-1">{title}</h3>
    <div class="flex gap-1 shrink-0">
      {pricing === 'free' && (
        <span class="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">무료</span>
      )}
      {status === 'beta' && (
        <span class="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">베타</span>
      )}
    </div>
  </div>
  <p class="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
  {benefits && (
    <p class="text-sm text-blue-600 line-clamp-1 mb-3">→ {benefits}</p>
  )}
  <div class="flex flex-wrap gap-1.5">
    {domains.map((domainId) => {
      const domain = getDomain(domainId);
      return domain ? (
        <span
          class="text-xs px-2 py-0.5 rounded-full"
          style={`background-color: ${domain.color}15; color: ${domain.color};`}
        >
          {domain.name}
        </span>
      ) : null;
    })}
    {tags.slice(0, 3).map((tag) => (
      <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
        {tag}
      </span>
    ))}
  </div>
</a>
```

- [ ] **Step 2: src/components/DomainGrid.astro 작성**

```astro
---
import { getAllDomains } from '../utils/domains';

const domains = getAllDomains();
---

<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
  {domains.map((domain) => (
    <a
      href={domain.status === 'active' ? `${import.meta.env.BASE_URL}domains/${domain.id}/` : '#'}
      class:list={[
        'flex flex-col items-center gap-2 p-4 rounded-lg border text-center transition-all',
        domain.status === 'active'
          ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer'
          : 'border-gray-100 opacity-50 cursor-default',
      ]}
    >
      <div
        class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
        style={`background-color: ${domain.color}15; color: ${domain.color};`}
      >
        <span class="font-bold text-sm">{domain.name.charAt(0)}</span>
      </div>
      <span class="text-sm font-medium text-gray-700">{domain.name}</span>
      {domain.status === 'upcoming' && (
        <span class="text-xs text-gray-400">준비 중</span>
      )}
    </a>
  ))}
</div>
```

- [ ] **Step 3: src/components/DomainFilter.astro 작성**

```astro
---
import { getActiveDomains } from '../utils/domains';

interface Props {
  currentDomain?: string;
  basePath: string;
}

const { currentDomain, basePath } = Astro.props;
const activeDomains = getActiveDomains();
---

<div class="flex flex-wrap gap-2 mb-6">
  <a
    href={basePath}
    class:list={[
      'text-sm px-3 py-1.5 rounded-full border transition-colors',
      !currentDomain
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300',
    ]}
  >
    전체
  </a>
  {activeDomains.map((domain) => (
    <a
      href={`${basePath}?domain=${domain.id}`}
      class:list={[
        'text-sm px-3 py-1.5 rounded-full border transition-colors',
        currentDomain === domain.id
          ? 'text-white border-transparent'
          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300',
      ]}
      style={currentDomain === domain.id ? `background-color: ${domain.color}; border-color: ${domain.color};` : ''}
    >
      {domain.name}
    </a>
  ))}
</div>
```

- [ ] **Step 4: src/components/TagList.astro 작성**

```astro
---
interface Props {
  tags: string[];
}

const { tags } = Astro.props;
---

<div class="flex flex-wrap gap-1.5">
  {tags.map((tag) => (
    <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
      {tag}
    </span>
  ))}
</div>
```

- [ ] **Step 5: src/components/CopyButton.astro 작성**

```astro
---
interface Props {
  text: string;
  label?: string;
}

const { text, label = '복사' } = Astro.props;
---

<div class="flex items-center gap-2 bg-gray-900 text-gray-100 rounded-lg px-4 py-3 font-mono text-sm">
  <code class="flex-1 overflow-x-auto">{text}</code>
  <button
    data-copy={text}
    class="shrink-0 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
    aria-label={label}
  >
    {label}
  </button>
</div>

<script>
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = (btn as HTMLElement).dataset.copy!;
      await navigator.clipboard.writeText(text);
      const original = btn.textContent;
      btn.textContent = '복사됨!';
      setTimeout(() => (btn.textContent = original), 1500);
    });
  });
</script>
```

- [ ] **Step 6: 커밋**

```bash
cd /Users/junehawk/Research/rndskills
git add src/components/Card.astro src/components/DomainGrid.astro src/components/DomainFilter.astro src/components/TagList.astro src/components/CopyButton.astro
git commit -m "feat: Card, DomainGrid, DomainFilter, TagList, CopyButton 컴포넌트"
```

---

## Task 5: 샘플 콘텐츠 작성

**Files:**
- Create: `content/mcps/korean-law.json`, `content/mcps/korean-law.mdx`
- Create: `content/mcps/kisti-vectordb.json`, `content/mcps/kisti-vectordb.mdx`
- Create: `content/skills/omc-ultrawork.json`, `content/skills/omc-ultrawork.mdx`
- Create: `content/guides/what-is-mcp.json`, `content/guides/what-is-mcp.mdx`
- Create: `content/cases/korean-law-research.json`

- [ ] **Step 1: content/mcps/korean-law.json 작성**

```json
{
  "id": "korean-law",
  "name": "한국 법률 검색 MCP",
  "description": "한국 법령, 판례, 행정해석 등을 AI 대화를 통해 검색할 수 있는 MCP 서버",
  "benefits": "법령 검색에 수시간 걸리던 작업을 AI 대화로 수분 내 완료. 관련 판례까지 자동 연결.",
  "author": "junehawk",
  "repository": "https://github.com/junehawk/korean-law-mcp",
  "version": "1.0.0",
  "license": "MIT",
  "pricing": "free",
  "prerequisites": ["Claude Desktop 또는 Claude Code", "Node.js 18+"],
  "category": "mcp",
  "domains": ["law-policy", "public-data"],
  "tags": ["법령", "판례", "행정해석", "공공API", "법제처"],
  "tools": ["search_law", "get_law_text", "search_precedents", "get_precedent_text", "search_interpretations"],
  "status": "active",
  "installMethod": "npm",
  "installCommand": "npx @junehawk/korean-law-mcp",
  "compatibility": ["claude-desktop", "claude-code", "cursor"],
  "featured": true,
  "addedAt": "2026-03-31",
  "updatedAt": "2026-03-31",
  "cases": ["korean-law-research"]
}
```

- [ ] **Step 2: content/mcps/korean-law.mdx 작성**

```mdx
## 소개

한국 법률 검색 MCP는 법제처의 국가법령정보센터 API를 활용하여, AI 도구(Claude 등)에서 직접 한국 법령과 판례를 검색할 수 있게 해줍니다.

## 주요 기능

- **법령 검색**: 법률명, 키워드로 현행 법령 검색
- **법령 본문 조회**: 특정 법률의 조문 전체 또는 특정 조항 조회
- **판례 검색**: 키워드, 법원, 사건유형으로 판례 검색
- **판례 본문 조회**: 판결문 전문 조회
- **행정해석 검색**: 유권해석, 질의회신 등 검색

## 활용 사례

- 연구 과제에 적용 가능한 법적 근거 빠르게 찾기
- 특정 법률의 개정 이력과 관련 판례를 한번에 파악
- 연구윤리, 데이터 보호 관련 법령 검토

## 기존 도구와의 차이

국가법령정보센터 웹사이트에서 직접 검색할 수도 있지만, MCP를 사용하면:
- AI가 맥락을 이해하고 관련 법령을 추천해줌
- 여러 법령/판례를 교차 분석하는 작업이 대화 한번으로 가능
- 검색 결과를 바로 보고서에 활용할 수 있는 형태로 정리
```

- [ ] **Step 3: content/mcps/kisti-vectordb.json 작성**

```json
{
  "id": "kisti-vectordb",
  "name": "KISTI 업무 문서 벡터 검색 MCP",
  "description": "KISTI 내부 업무 문서 9,644건을 벡터 검색으로 탐색할 수 있는 MCP 서버",
  "benefits": "흩어져 있는 업무 문서를 AI가 의미 기반으로 찾아줌. 키워드가 기억나지 않아도 검색 가능.",
  "author": "junehawk",
  "repository": "https://github.com/junehawk/kisti-vectordb-mcp",
  "version": "1.0.0",
  "license": "MIT",
  "pricing": "free",
  "prerequisites": ["Claude Desktop 또는 Claude Code", "KISTI 내부 네트워크 접근"],
  "category": "mcp",
  "domains": ["research-admin", "public-data"],
  "tags": ["벡터검색", "RAG", "업무문서", "KISTI"],
  "tools": ["search_documents", "get_document", "get_stats", "list_documents"],
  "status": "active",
  "installMethod": "config",
  "installCommand": "Claude Desktop 설정에서 MCP 서버 주소 추가",
  "compatibility": ["claude-desktop", "claude-code"],
  "featured": true,
  "addedAt": "2026-03-31",
  "updatedAt": "2026-03-31",
  "cases": []
}
```

- [ ] **Step 4: content/mcps/kisti-vectordb.mdx 작성**

```mdx
## 소개

KISTI 업무 문서 벡터 검색 MCP는 KISTI 내부에서 생산된 약 9,644건의 업무 문서(381K 청크)를 벡터 DB에 색인하여, 의미 기반 검색을 제공합니다.

## 주요 기능

- **시맨틱 검색**: 키워드가 정확히 일치하지 않아도 의미가 유사한 문서를 찾아줌
- **문서 조회**: 검색된 문서의 상세 내용 확인
- **통계 조회**: 색인된 문서 수, 청크 수 등 DB 현황 파악

## 활용 사례

- "작년에 봤던 클라우드 마이그레이션 관련 보고서" 같은 모호한 기억으로도 검색
- 유사 업무를 수행했던 과거 문서를 참고하여 새 보고서 작성
- 기관 내부 정책이나 가이드라인 빠르게 확인

## 참고사항

이 MCP는 KISTI 내부 네트워크에서만 접근 가능합니다. 외부에서는 Tailscale VPN을 통해 접속할 수 있습니다.
```

- [ ] **Step 5: content/skills/omc-ultrawork.json 작성**

```json
{
  "id": "omc-ultrawork",
  "name": "OMC Ultrawork",
  "description": "Claude Code에서 병렬 에이전트를 활용해 작업 속도를 극대화하는 Skill",
  "benefits": "복잡한 코딩 작업을 여러 AI 에이전트가 동시에 처리하여 작업 시간을 크게 단축.",
  "author": "pinkpixel",
  "repository": "https://github.com/nicobailey-llc/oh-my-claudecode",
  "version": "5.0.0",
  "license": "MIT",
  "pricing": "free",
  "prerequisites": ["Claude Code CLI"],
  "category": "skill",
  "domains": ["dev-tools"],
  "tags": ["claude-code", "병렬처리", "에이전트", "자동화"],
  "platform": "claude-code",
  "installMethod": "plugin",
  "installCommand": "claude install oh-my-claudecode",
  "status": "active",
  "featured": false,
  "addedAt": "2026-03-31",
  "cases": []
}
```

- [ ] **Step 6: content/skills/omc-ultrawork.mdx 작성**

```mdx
## 소개

OMC(Oh My ClaudeCode) Ultrawork는 Claude Code CLI에서 사용할 수 있는 플러그인으로, 여러 AI 에이전트를 병렬로 실행하여 복잡한 작업을 빠르게 처리합니다.

## 주요 기능

- **병렬 에이전트 오케스트레이션**: 독립적인 작업을 여러 에이전트가 동시에 수행
- **자동 작업 분배**: 작업을 분석하여 병렬화 가능한 부분을 자동 식별
- **진행 상황 추적**: 각 에이전트의 작업 상태를 실시간으로 확인

## 사용 방법

Claude Code에서 `/ultrawork` 명령어를 입력하면 활성화됩니다.

## 대상 사용자

이 Skill은 Claude Code CLI에 익숙한 개발자를 대상으로 합니다. 코드 작성, 리팩토링, 테스트 등의 개발 작업에 특화되어 있습니다.
```

- [ ] **Step 7: content/guides/what-is-mcp.json 작성**

```json
{
  "id": "what-is-mcp",
  "title": "AI 도구와 MCP, 왜 연구에 필요한가?",
  "description": "MCP(Model Context Protocol)가 무엇이고, 연구자에게 어떤 도움이 되는지 알아봅니다.",
  "difficulty": "beginner",
  "tags": ["시작하기", "MCP", "개념"],
  "order": 0,
  "addedAt": "2026-03-31"
}
```

- [ ] **Step 8: content/guides/what-is-mcp.mdx 작성**

```mdx
## MCP가 뭔가요?

MCP(Model Context Protocol)는 **AI 도구에 플러그인을 꽂는 것**과 같습니다.

평소에 Claude 같은 AI와 대화할 때, AI는 인터넷에 접속하거나 여러분의 데이터베이스를 직접 검색할 수 없습니다. AI가 알고 있는 것은 학습 데이터까지입니다.

MCP를 사용하면 AI가 **외부 데이터에 직접 접근**할 수 있게 됩니다:
- 국가법령정보센터에서 법령을 실시간 검색
- 기관 내부 문서를 의미 기반으로 탐색
- 공공데이터포털 API를 호출하여 최신 데이터 조회

## 기존 방식과 뭐가 다른가요?

**기존**: 법령 검색 → 국가법령정보센터 접속 → 키워드 입력 → 결과 탐색 → 복사 → AI에 붙여넣기 → 분석 요청

**MCP 사용**: AI에게 "개인정보보호법에서 연구 목적 데이터 처리 관련 조항 찾아줘" → AI가 직접 법령을 검색하고 분석까지 한번에

## 무엇이 필요한가요?

MCP를 사용하려면 다음이 필요합니다:

1. **Claude Desktop** (월 $20, 약 27,000원) 또는 **Claude Code** (API 종량제)
2. **Node.js** (무료, 프로그래밍 런타임) — 대부분의 MCP가 Node.js로 실행됩니다
3. **사용하고 싶은 MCP 서버** — 이 사이트에서 찾을 수 있습니다!

> 다음 가이드에서 Claude Desktop 설치부터 첫 MCP 연결까지 단계별로 안내합니다.
```

- [ ] **Step 9: content/cases/korean-law-research.json 작성**

```json
{
  "id": "korean-law-research",
  "title": "Korean Law MCP로 법률 리서치 자동화하기",
  "type": "blog",
  "url": "https://github.com/junehawk/korean-law-mcp",
  "author": "junehawk",
  "relatedItems": ["korean-law"],
  "language": "ko",
  "addedAt": "2026-03-31"
}
```

- [ ] **Step 10: 빌드 검증**

```bash
cd /Users/junehawk/Research/rndskills
pnpm build
```

Expected: 빌드 성공. Content Collections 스키마 검증 통과.

- [ ] **Step 11: 커밋**

```bash
cd /Users/junehawk/Research/rndskills
git add content/mcps/ content/skills/ content/guides/ content/cases/
git commit -m "feat: 초기 샘플 콘텐츠 (MCP 2개, Skill 1개, 가이드 1개, 사례 1개)"
```

---

## Task 6: 목록/상세 레이아웃 + MCP 페이지

**Files:**
- Create: `src/layouts/ListLayout.astro`
- Create: `src/layouts/DetailLayout.astro`
- Create: `src/pages/mcps/index.astro`
- Create: `src/pages/mcps/[id].astro`

- [ ] **Step 1: src/layouts/ListLayout.astro 작성**

```astro
---
import BaseLayout from './BaseLayout.astro';

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<BaseLayout title={title} description={description}>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      {description && <p class="text-gray-600">{description}</p>}
    </div>
    <slot />
  </div>
</BaseLayout>
```

- [ ] **Step 2: src/layouts/DetailLayout.astro 작성**

```astro
---
import BaseLayout from './BaseLayout.astro';

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<BaseLayout title={title} description={description}>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <a href="javascript:history.back()" class="text-sm text-blue-600 hover:underline mb-4 inline-block">← 뒤로가기</a>
    <slot />
  </div>
</BaseLayout>
```

- [ ] **Step 3: src/pages/mcps/index.astro 작성**

```astro
---
import { getCollection } from 'astro:content';
import ListLayout from '../../layouts/ListLayout.astro';
import Card from '../../components/Card.astro';
import DomainFilter from '../../components/DomainFilter.astro';

const allMcps = await getCollection('mcps');
const mcps = allMcps.sort((a, b) => {
  if (a.data.featured && !b.data.featured) return -1;
  if (!a.data.featured && b.data.featured) return 1;
  return new Date(b.data.addedAt).getTime() - new Date(a.data.addedAt).getTime();
});
---

<ListLayout title="MCP 서버" description="AI 도구에 연결하여 외부 데이터와 서비스를 활용할 수 있는 MCP 서버 모음">
  <DomainFilter basePath={`${import.meta.env.BASE_URL}mcps/`} />

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="mcp-list">
    {mcps.map((mcp) => (
      <div data-domains={mcp.data.domains.join(',')} data-tags={mcp.data.tags.join(',')}>
        <Card
          title={mcp.data.name}
          description={mcp.data.description}
          benefits={mcp.data.benefits}
          href={`${import.meta.env.BASE_URL}mcps/${mcp.data.id}/`}
          domains={mcp.data.domains}
          tags={mcp.data.tags}
          pricing={mcp.data.pricing}
          status={mcp.data.status}
        />
      </div>
    ))}
  </div>

  {mcps.length === 0 && (
    <p class="text-center text-gray-500 py-12">아직 등록된 MCP 서버가 없습니다.</p>
  )}
</ListLayout>

<script>
  // 클라이언트 사이드 도메인 필터링
  const params = new URLSearchParams(window.location.search);
  const domain = params.get('domain');
  if (domain) {
    document.querySelectorAll('#mcp-list > div').forEach((el) => {
      const domains = (el as HTMLElement).dataset.domains || '';
      if (!domains.split(',').includes(domain)) {
        (el as HTMLElement).style.display = 'none';
      }
    });
  }
</script>
```

- [ ] **Step 4: src/pages/mcps/[id].astro 작성**

```astro
---
import { getCollection } from 'astro:content';
import DetailLayout from '../../layouts/DetailLayout.astro';
import CopyButton from '../../components/CopyButton.astro';
import TagList from '../../components/TagList.astro';
import { getDomain } from '../../utils/domains';

export async function getStaticPaths() {
  const mcps = await getCollection('mcps');
  return mcps.map((mcp) => ({
    params: { id: mcp.data.id },
    props: { mcp },
  }));
}

const { mcp } = Astro.props;
const data = mcp.data;

// MDX 본문 로드 시도
let Content: any = null;
try {
  const mdxFiles = import.meta.glob('../../content/mcps/*.mdx');
  const mdxPath = `../../content/mcps/${data.id}.mdx`;
  if (mdxFiles[mdxPath]) {
    const mod = await mdxFiles[mdxPath]();
    Content = (mod as any).default;
  }
} catch {}
---

<DetailLayout title={data.name} description={data.description}>
  <article>
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-2">
        {data.pricing === 'free' && (
          <span class="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">무료</span>
        )}
        <span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{data.status}</span>
        <span class="text-xs text-gray-400">v{data.version}</span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{data.name}</h1>
      <p class="text-lg text-gray-600 mb-4">{data.description}</p>

      {data.benefits && (
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p class="text-blue-800 font-medium">→ {data.benefits}</p>
        </div>
      )}
    </div>

    <!-- 메타 정보 -->
    <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
      <div>
        <span class="text-gray-500">제작자</span>
        <p class="font-medium">{data.author}</p>
      </div>
      <div>
        <span class="text-gray-500">라이선스</span>
        <p class="font-medium">{data.license}</p>
      </div>
      <div>
        <span class="text-gray-500">호환성</span>
        <p class="font-medium">{data.compatibility.join(', ')}</p>
      </div>
      <div>
        <span class="text-gray-500">저장소</span>
        <a href={data.repository} class="font-medium text-blue-600 hover:underline" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>

    <!-- 선행 조건 -->
    {data.prerequisites.length > 0 && (
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">필요한 것</h2>
        <ul class="list-disc list-inside text-gray-600 space-y-1">
          {data.prerequisites.map((p: string) => <li>{p}</li>)}
        </ul>
      </div>
    )}

    <!-- 설치 -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">설치 방법</h2>
      <CopyButton text={data.installCommand} />
    </div>

    <!-- 제공 도구 -->
    {data.tools.length > 0 && (
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">제공 도구</h2>
        <div class="flex flex-wrap gap-2">
          {data.tools.map((tool: string) => (
            <code class="text-sm px-2 py-1 bg-gray-100 rounded">{tool}</code>
          ))}
        </div>
      </div>
    )}

    <!-- 도메인 & 태그 -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">분류</h2>
      <div class="flex flex-wrap gap-2 mb-2">
        {data.domains.map((domainId: string) => {
          const domain = getDomain(domainId);
          return domain ? (
            <a
              href={`${import.meta.env.BASE_URL}domains/${domain.id}/`}
              class="text-sm px-3 py-1 rounded-full"
              style={`background-color: ${domain.color}15; color: ${domain.color};`}
            >
              {domain.name}
            </a>
          ) : null;
        })}
      </div>
      <TagList tags={data.tags} />
    </div>

    <!-- MDX 본문 -->
    {Content && (
      <div class="prose prose-gray max-w-none mt-8 pt-8 border-t border-gray-200">
        <Content />
      </div>
    )}
  </article>
</DetailLayout>
```

- [ ] **Step 5: 개발 서버에서 MCP 목록/상세 확인**

```bash
cd /Users/junehawk/Research/rndskills
pnpm dev
```

Expected: `/mcps/`에서 카드 목록 표시, `/mcps/korean-law/`에서 상세 정보 표시.

- [ ] **Step 6: 커밋**

```bash
cd /Users/junehawk/Research/rndskills
git add src/layouts/ src/pages/mcps/
git commit -m "feat: MCP 목록/상세 페이지 + ListLayout + DetailLayout"
```

---

## Task 7: Skill, Guide, Cases, Domain 페이지

**Files:**
- Create: `src/pages/skills/index.astro`, `src/pages/skills/[id].astro`
- Create: `src/pages/guides/index.astro`, `src/pages/guides/[id].astro`
- Create: `src/pages/cases/index.astro`
- Create: `src/pages/domains/[id].astro`

- [ ] **Step 1: src/pages/skills/index.astro 작성**

```astro
---
import { getCollection } from 'astro:content';
import ListLayout from '../../layouts/ListLayout.astro';
import Card from '../../components/Card.astro';
import DomainFilter from '../../components/DomainFilter.astro';

const allSkills = await getCollection('skills');
const skills = allSkills.sort((a, b) => {
  if (a.data.featured && !b.data.featured) return -1;
  if (!a.data.featured && b.data.featured) return 1;
  return new Date(b.data.addedAt).getTime() - new Date(a.data.addedAt).getTime();
});
---

<ListLayout title="Skills" description="Claude Code에서 활용할 수 있는 AI Skill 모음">
  <DomainFilter basePath={`${import.meta.env.BASE_URL}skills/`} />

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="skill-list">
    {skills.map((skill) => (
      <div data-domains={skill.data.domains.join(',')}>
        <Card
          title={skill.data.name}
          description={skill.data.description}
          benefits={skill.data.benefits}
          href={`${import.meta.env.BASE_URL}skills/${skill.data.id}/`}
          domains={skill.data.domains}
          tags={skill.data.tags}
          pricing={skill.data.pricing}
          status={skill.data.status}
        />
      </div>
    ))}
  </div>

  {skills.length === 0 && (
    <p class="text-center text-gray-500 py-12">아직 등록된 Skill이 없습니다.</p>
  )}
</ListLayout>

<script>
  const params = new URLSearchParams(window.location.search);
  const domain = params.get('domain');
  if (domain) {
    document.querySelectorAll('#skill-list > div').forEach((el) => {
      const domains = (el as HTMLElement).dataset.domains || '';
      if (!domains.split(',').includes(domain)) {
        (el as HTMLElement).style.display = 'none';
      }
    });
  }
</script>
```

- [ ] **Step 2: src/pages/skills/[id].astro 작성**

```astro
---
import { getCollection } from 'astro:content';
import DetailLayout from '../../layouts/DetailLayout.astro';
import CopyButton from '../../components/CopyButton.astro';
import TagList from '../../components/TagList.astro';
import { getDomain } from '../../utils/domains';

export async function getStaticPaths() {
  const skills = await getCollection('skills');
  return skills.map((skill) => ({
    params: { id: skill.data.id },
    props: { skill },
  }));
}

const { skill } = Astro.props;
const data = skill.data;

let Content: any = null;
try {
  const mdxFiles = import.meta.glob('../../content/skills/*.mdx');
  const mdxPath = `../../content/skills/${data.id}.mdx`;
  if (mdxFiles[mdxPath]) {
    const mod = await mdxFiles[mdxPath]();
    Content = (mod as any).default;
  }
} catch {}
---

<DetailLayout title={data.name} description={data.description}>
  <article>
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-2">
        {data.pricing === 'free' && (
          <span class="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">무료</span>
        )}
        <span class="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">Skill</span>
        <span class="text-xs text-gray-400">v{data.version}</span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{data.name}</h1>
      <p class="text-lg text-gray-600 mb-4">{data.description}</p>

      {data.benefits && (
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p class="text-blue-800 font-medium">→ {data.benefits}</p>
        </div>
      )}
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
      <div>
        <span class="text-gray-500">제작자</span>
        <p class="font-medium">{data.author}</p>
      </div>
      <div>
        <span class="text-gray-500">라이선스</span>
        <p class="font-medium">{data.license}</p>
      </div>
      <div>
        <span class="text-gray-500">플랫폼</span>
        <p class="font-medium">{data.platform}</p>
      </div>
      <div>
        <span class="text-gray-500">저장소</span>
        <a href={data.repository} class="font-medium text-blue-600 hover:underline" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>

    {data.prerequisites.length > 0 && (
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">필요한 것</h2>
        <ul class="list-disc list-inside text-gray-600 space-y-1">
          {data.prerequisites.map((p: string) => <li>{p}</li>)}
        </ul>
      </div>
    )}

    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">설치 방법</h2>
      <CopyButton text={data.installCommand} />
    </div>

    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">분류</h2>
      <div class="flex flex-wrap gap-2 mb-2">
        {data.domains.map((domainId: string) => {
          const domain = getDomain(domainId);
          return domain ? (
            <a
              href={`${import.meta.env.BASE_URL}domains/${domain.id}/`}
              class="text-sm px-3 py-1 rounded-full"
              style={`background-color: ${domain.color}15; color: ${domain.color};`}
            >
              {domain.name}
            </a>
          ) : null;
        })}
      </div>
      <TagList tags={data.tags} />
    </div>

    {Content && (
      <div class="prose prose-gray max-w-none mt-8 pt-8 border-t border-gray-200">
        <Content />
      </div>
    )}
  </article>
</DetailLayout>
```

- [ ] **Step 3: src/pages/guides/index.astro 작성**

```astro
---
import { getCollection } from 'astro:content';
import ListLayout from '../../layouts/ListLayout.astro';

const allGuides = await getCollection('guides');
const guides = allGuides.sort((a, b) => a.data.order - b.data.order);

const difficultyLabel: Record<string, string> = {
  beginner: '입문',
  intermediate: '중급',
  advanced: '고급',
};
const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};
---

<ListLayout title="시작하기" description="AI 도구를 처음 접하는 연구자를 위한 단계별 가이드">
  <div class="space-y-4">
    {guides.map((guide, i) => (
      <a
        href={`${import.meta.env.BASE_URL}guides/${guide.data.id}/`}
        class="block bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
      >
        <div class="flex items-center gap-3">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
            {i + 1}
          </span>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-gray-900">{guide.data.title}</h3>
              <span class={`text-xs px-2 py-0.5 rounded-full ${difficultyColor[guide.data.difficulty]}`}>
                {difficultyLabel[guide.data.difficulty]}
              </span>
            </div>
            <p class="text-sm text-gray-600">{guide.data.description}</p>
          </div>
        </div>
      </a>
    ))}
  </div>

  {guides.length === 0 && (
    <p class="text-center text-gray-500 py-12">아직 등록된 가이드가 없습니다.</p>
  )}
</ListLayout>
```

- [ ] **Step 4: src/pages/guides/[id].astro 작성**

```astro
---
import { getCollection } from 'astro:content';
import DetailLayout from '../../layouts/DetailLayout.astro';

export async function getStaticPaths() {
  const guides = await getCollection('guides');
  return guides.map((guide) => ({
    params: { id: guide.data.id },
    props: { guide },
  }));
}

const { guide } = Astro.props;
const data = guide.data;

let Content: any = null;
try {
  const mdxFiles = import.meta.glob('../../content/guides/*.mdx');
  const mdxPath = `../../content/guides/${data.id}.mdx`;
  if (mdxFiles[mdxPath]) {
    const mod = await mdxFiles[mdxPath]();
    Content = (mod as any).default;
  }
} catch {}
---

<DetailLayout title={data.title} description={data.description}>
  <article>
    <h1 class="text-3xl font-bold text-gray-900 mb-4">{data.title}</h1>
    <p class="text-lg text-gray-600 mb-8">{data.description}</p>

    {Content ? (
      <div class="prose prose-gray max-w-none">
        <Content />
      </div>
    ) : (
      <p class="text-gray-500">콘텐츠 준비 중입니다.</p>
    )}
  </article>
</DetailLayout>
```

- [ ] **Step 5: src/pages/cases/index.astro 작성**

```astro
---
import { getCollection } from 'astro:content';
import ListLayout from '../../layouts/ListLayout.astro';

const allCases = await getCollection('cases');
const cases = allCases.sort((a, b) => new Date(b.data.addedAt).getTime() - new Date(a.data.addedAt).getTime());

const typeLabel: Record<string, string> = {
  blog: '블로그',
  video: '영상',
  paper: '논문',
  tutorial: '튜토리얼',
};
const typeIcon: Record<string, string> = {
  blog: '📝',
  video: '🎬',
  paper: '📄',
  tutorial: '📚',
};
---

<ListLayout title="활용 사례" description="MCP와 Skill을 실제 연구/업무에 활용한 사례 모음">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {cases.map((c) => (
      <a
        href={c.data.url}
        target="_blank"
        rel="noopener"
        class="block bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
      >
        <div class="flex items-start gap-3">
          <span class="text-2xl">{typeIcon[c.data.type] || '📝'}</span>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-gray-900">{c.data.title}</h3>
              <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                {typeLabel[c.data.type]}
              </span>
            </div>
            <p class="text-sm text-gray-500">by {c.data.author}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400 ml-auto shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </div>
      </a>
    ))}
  </div>

  {cases.length === 0 && (
    <p class="text-center text-gray-500 py-12">아직 등록된 사례가 없습니다.</p>
  )}
</ListLayout>
```

- [ ] **Step 6: src/pages/domains/[id].astro 작성**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Card from '../../components/Card.astro';
import { getDomain, getActiveDomains } from '../../utils/domains';

export async function getStaticPaths() {
  const activeDomains = getActiveDomains();
  return activeDomains.map((domain) => ({
    params: { id: domain.id },
    props: { domain },
  }));
}

const { domain } = Astro.props;

const allMcps = await getCollection('mcps');
const allSkills = await getCollection('skills');
const allGuides = await getCollection('guides');

const mcps = allMcps.filter((m) => m.data.domains.includes(domain.id));
const skills = allSkills.filter((s) => s.data.domains.includes(domain.id));
---

<BaseLayout title={domain.name} description={domain.description}>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8">
      <div
        class="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 text-xl font-bold"
        style={`background-color: ${domain.color}15; color: ${domain.color};`}
      >
        {domain.name.charAt(0)}
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{domain.name}</h1>
      <p class="text-gray-600">{domain.description}</p>
    </div>

    {mcps.length > 0 && (
      <section class="mb-10">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">MCP 서버</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mcps.map((mcp) => (
            <Card
              title={mcp.data.name}
              description={mcp.data.description}
              benefits={mcp.data.benefits}
              href={`${import.meta.env.BASE_URL}mcps/${mcp.data.id}/`}
              domains={mcp.data.domains}
              tags={mcp.data.tags}
              pricing={mcp.data.pricing}
            />
          ))}
        </div>
      </section>
    )}

    {skills.length > 0 && (
      <section class="mb-10">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <Card
              title={skill.data.name}
              description={skill.data.description}
              benefits={skill.data.benefits}
              href={`${import.meta.env.BASE_URL}skills/${skill.data.id}/`}
              domains={skill.data.domains}
              tags={skill.data.tags}
              pricing={skill.data.pricing}
            />
          ))}
        </div>
      </section>
    )}

    {mcps.length === 0 && skills.length === 0 && (
      <p class="text-center text-gray-500 py-12">이 도메인에 등록된 도구가 아직 없습니다.</p>
    )}
  </div>
</BaseLayout>
```

- [ ] **Step 7: 개발 서버에서 모든 페이지 확인**

```bash
cd /Users/junehawk/Research/rndskills
pnpm dev
```

Expected: `/skills/`, `/guides/`, `/cases/`, `/domains/law-policy/` 모두 표시.

- [ ] **Step 8: 커밋**

```bash
cd /Users/junehawk/Research/rndskills
git add src/pages/skills/ src/pages/guides/ src/pages/cases/ src/pages/domains/
git commit -m "feat: Skill, Guide, Cases, Domain 페이지"
```

---

## Task 8: 홈페이지

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/components/HeroExplainer.astro`

- [ ] **Step 1: src/components/HeroExplainer.astro 작성**

```astro
<section class="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
      국내 R&D를 위한<br />AI 도구 확장 모음
    </h1>
    <p class="text-lg md:text-xl text-gray-600 mb-6">
      MCP와 Skill로 법률 검색, 논문 분석, 공공데이터 활용을 AI로 자동화하세요
    </p>
    <div class="bg-white border border-blue-200 rounded-xl p-6 text-left max-w-2xl mx-auto mb-8">
      <h2 class="font-semibold text-blue-900 mb-2">MCP가 뭔가요?</h2>
      <p class="text-gray-600 text-sm leading-relaxed">
        MCP(Model Context Protocol)는 <strong>AI에 플러그인을 꽂는 것</strong>과 같습니다.
        Claude 같은 AI가 법령 DB, 논문 DB, 공공데이터에 직접 접근하여 검색하고 분석할 수 있게 해줍니다.
        키워드가 생각나지 않아도, AI에게 자연어로 물어보면 됩니다.
      </p>
      <a href={`${import.meta.env.BASE_URL}guides/what-is-mcp/`} class="text-sm text-blue-600 hover:underline mt-2 inline-block">
        더 알아보기 →
      </a>
    </div>
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <a
        href={`${import.meta.env.BASE_URL}guides/`}
        class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        처음이신가요? 시작하기
      </a>
      <a
        href={`${import.meta.env.BASE_URL}mcps/`}
        class="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:border-blue-300 transition-colors"
      >
        MCP 서버 둘러보기
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: src/pages/index.astro 교체**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroExplainer from '../components/HeroExplainer.astro';
import Card from '../components/Card.astro';
import DomainGrid from '../components/DomainGrid.astro';
import { getCollection } from 'astro:content';

const allMcps = await getCollection('mcps');
const allSkills = await getCollection('skills');

const featured = [
  ...allMcps.filter((m) => m.data.featured),
  ...allSkills.filter((s) => s.data.featured),
];

const recent = [...allMcps, ...allSkills]
  .sort((a, b) => new Date(b.data.addedAt).getTime() - new Date(a.data.addedAt).getTime())
  .slice(0, 6);
---

<BaseLayout title="R&D MCP Hub">
  <HeroExplainer />

  <!-- 추천 항목 -->
  {featured.length > 0 && (
    <section class="max-w-6xl mx-auto px-4 py-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">추천</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featured.map((item) => (
          <Card
            title={item.data.name}
            description={item.data.description}
            benefits={item.data.benefits}
            href={`${import.meta.env.BASE_URL}${item.data.category === 'mcp' ? 'mcps' : 'skills'}/${item.data.id}/`}
            domains={item.data.domains}
            tags={item.data.tags}
            pricing={item.data.pricing}
          />
        ))}
      </div>
    </section>
  )}

  <!-- 도메인별 바로가기 -->
  <section class="max-w-6xl mx-auto px-4 py-12">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">R&D 도메인별 탐색</h2>
    <DomainGrid />
  </section>

  <!-- 최근 등록 -->
  {recent.length > 0 && (
    <section class="max-w-6xl mx-auto px-4 py-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">최근 등록</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recent.map((item) => (
          <Card
            title={item.data.name}
            description={item.data.description}
            href={`${import.meta.env.BASE_URL}${item.data.category === 'mcp' ? 'mcps' : 'skills'}/${item.data.id}/`}
            domains={item.data.domains}
            tags={item.data.tags}
            pricing={item.data.pricing}
          />
        ))}
      </div>
    </section>
  )}
</BaseLayout>
```

- [ ] **Step 3: 개발 서버 확인**

```bash
cd /Users/junehawk/Research/rndskills
pnpm dev
```

Expected: 홈페이지에 히어로 + MCP 설명 + 추천 카드 + 도메인 그리드 + 최근 등록 표시.

- [ ] **Step 4: 커밋**

```bash
cd /Users/junehawk/Research/rndskills
git add src/pages/index.astro src/components/HeroExplainer.astro
git commit -m "feat: 홈페이지 (히어로 + MCP 설명 + 추천 + 도메인 + 최근 등록)"
```

---

## Task 9: About, FAQ, Search 페이지

**Files:**
- Create: `src/pages/about.astro`
- Create: `src/pages/faq.astro`
- Create: `src/pages/search.astro`

- [ ] **Step 1: src/pages/about.astro 작성**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="소개" description="R&D MCP Hub 소개 및 큐레이션 기준">
  <div class="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
    <h1>소개</h1>

    <h2>R&D MCP Hub란?</h2>
    <p>
      국내 R&D 연구자들이 AI 도구(Claude 등)를 연구에 효과적으로 활용할 수 있도록,
      유용한 MCP 서버와 Skill을 발굴하고 한국어로 소개하는 큐레이션 사이트입니다.
    </p>

    <h2>운영 주체</h2>
    <p>
      KISTI 소속 연구자가 개인 프로젝트로 운영하고 있습니다.
      AI 도구를 직접 연구 업무에 활용하면서 느낀 필요에서 시작했습니다.
    </p>

    <h2>큐레이션 기준</h2>
    <p>이 사이트에 등록되는 MCP/Skill은 다음 기준을 충족합니다:</p>
    <ul>
      <li><strong>오픈소스 또는 명확한 라이선스</strong> — 기관에서 사용 가능한지 판단할 수 있어야 합니다</li>
      <li><strong>한국 R&D에 실질적 유용성</strong> — 국내 연구 환경에서 실제로 도움이 되는 도구만 포함합니다</li>
      <li><strong>직접 테스트 완료</strong> — 등록 전 설치와 기본 기능을 직접 검증합니다</li>
      <li><strong>보안 관점에서 명백한 위험 없음</strong> — 악성 코드나 불필요한 데이터 수집이 없어야 합니다</li>
    </ul>

    <h2>"추천" 선정 기준</h2>
    <p>
      홈페이지 추천(featured) 항목은 직접 사용 경험이 있고,
      R&D 적합성과 완성도가 높은 도구를 선정합니다.
    </p>

    <h2>연락처</h2>
    <ul>
      <li>GitHub Issues: <a href="https://github.com/junehawk/rndskills/issues">github.com/junehawk/rndskills</a></li>
      <li>새로운 MCP/Skill 제보도 GitHub Issue로 받고 있습니다</li>
    </ul>
  </div>
</BaseLayout>
```

- [ ] **Step 2: src/pages/faq.astro 작성**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';

const faqs = [
  {
    category: '비용',
    items: [
      {
        q: 'MCP 서버를 사용하려면 돈이 드나요?',
        a: 'MCP 서버 자체는 대부분 무료 오픈소스입니다. 다만 MCP를 연결할 AI 도구(Claude)에 대한 구독이 필요합니다. Claude Desktop Pro는 월 $20(약 27,000원), Claude Code는 API 종량제입니다.',
      },
      {
        q: '연구비로 처리할 수 있나요?',
        a: '소프트웨어 사용료 또는 클라우드 서비스 비목으로 처리할 수 있습니다. 정확한 비목은 기관의 연구비 관리 규정을 확인하세요.',
      },
    ],
  },
  {
    category: '보안',
    items: [
      {
        q: '연구 데이터를 AI에 보내도 되나요?',
        a: '민감한 연구 데이터(미공개 논문, 개인정보, 국가과제 보안 자료)는 AI에 입력하지 마세요. 공개된 법령, 논문 메타데이터 등은 안전하게 활용할 수 있습니다.',
      },
      {
        q: 'MCP는 내 데이터를 어디로 보내나요?',
        a: 'MCP는 로컬(내 PC)에서 실행되며, 외부 데이터 소스(법령 DB 등)에 쿼리를 보내고 결과를 AI에 전달하는 중개 역할을 합니다. 각 MCP의 데이터 처리 방식은 상세 페이지에서 확인하세요.',
      },
    ],
  },
  {
    category: '기관 네트워크',
    items: [
      {
        q: '기관 방화벽에서 npm 설치가 안 됩니다',
        a: 'IT 부서에 registry.npmjs.org를 화이트리스트에 추가 요청하거나, 프록시 설정(npm config set proxy)을 확인하세요. 또는 외부 네트워크에서 설치 후 사용하는 방법도 있습니다.',
      },
      {
        q: 'Claude API 접속이 차단됩니다',
        a: 'IT 부서에 api.anthropic.com을 화이트리스트에 추가 요청하세요.',
      },
    ],
  },
  {
    category: '설치 환경',
    items: [
      {
        q: 'Node.js가 뭔가요? 꼭 필요한가요?',
        a: 'Node.js는 JavaScript 프로그램을 실행하는 도구입니다. 대부분의 MCP 서버가 Node.js로 만들어져 있어서 설치가 필요합니다. nodejs.org에서 무료로 다운로드할 수 있습니다.',
      },
      {
        q: '관리자 권한 없이 설치할 수 있나요?',
        a: 'nvm(Node Version Manager)을 사용하면 관리자 권한 없이 Node.js를 설치할 수 있습니다. Claude Desktop도 사용자 폴더에 설치됩니다.',
      },
      {
        q: 'Windows에서도 사용할 수 있나요?',
        a: '네, Claude Desktop과 대부분의 MCP 서버는 Windows, macOS 모두 지원합니다.',
      },
    ],
  },
];
---

<BaseLayout title="FAQ" description="MCP 사용에 관한 자주 묻는 질문">
  <div class="max-w-3xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">자주 묻는 질문</h1>

    {faqs.map((section) => (
      <div class="mb-10">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          {section.category}
        </h2>
        <div class="space-y-4">
          {section.items.map((faq) => (
            <details class="bg-white border border-gray-200 rounded-lg">
              <summary class="px-5 py-4 cursor-pointer font-medium text-gray-900 hover:text-blue-600 transition-colors">
                {faq.q}
              </summary>
              <div class="px-5 pb-4 text-gray-600 text-sm leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    ))}
  </div>
</BaseLayout>
```

- [ ] **Step 3: src/pages/search.astro 작성**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="검색" description="MCP, Skill, 가이드 통합 검색">
  <div class="max-w-3xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">검색</h1>
    <div id="search"></div>
  </div>
</BaseLayout>

<script>
  import { PagefindUI } from '@nicktomlin/pagefind-ui';

  window.addEventListener('DOMContentLoaded', () => {
    new PagefindUI({
      element: '#search',
      showSubResults: true,
      translations: {
        placeholder: 'MCP, Skill, 가이드 검색...',
        zero_results: '검색 결과가 없습니다',
        many_results: '${count}개의 결과',
        one_result: '1개의 결과',
      },
    });
  });
</script>

<style is:global>
  .pagefind-ui__search-input {
    @apply w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500;
  }
  .pagefind-ui__result-link {
    @apply text-blue-600 hover:underline font-medium;
  }
</style>
```

주의: Pagefind는 `pnpm build` 후에만 인덱스가 생성됩니다. 개발 서버에서는 검색이 동작하지 않을 수 있습니다.

- [ ] **Step 4: Pagefind 설치**

```bash
cd /Users/junehawk/Research/rndskills
pnpm add -D pagefind @nicktomlin/pagefind-ui
```

Note: Pagefind는 빌드 후 후처리로 실행합니다. `package.json`의 build 스크립트를 업데이트:

`package.json`의 `"scripts"` 섹션에서 `"build"` 값을 다음으로 변경:

```json
"build": "astro build && npx pagefind --site dist"
```

- [ ] **Step 5: 빌드 테스트**

```bash
cd /Users/junehawk/Research/rndskills
pnpm build
```

Expected: Astro 빌드 성공 + Pagefind 인덱스 생성.

- [ ] **Step 6: 커밋**

```bash
cd /Users/junehawk/Research/rndskills
git add src/pages/about.astro src/pages/faq.astro src/pages/search.astro package.json
git commit -m "feat: About, FAQ, Search(Pagefind) 페이지"
```

---

## Task 10: RSS, robots.txt, GitHub Actions 배포

**Files:**
- Create: `src/pages/rss.xml.ts`
- Create: `public/robots.txt`
- Create: `.github/workflows/deploy.yml`
- Create: `.github/ISSUE_TEMPLATE/new-mcp-submission.yml`

- [ ] **Step 1: src/pages/rss.xml.ts 작성**

```typescript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const mcps = await getCollection('mcps');
  const skills = await getCollection('skills');

  const items = [...mcps, ...skills]
    .sort((a, b) => new Date(b.data.addedAt).getTime() - new Date(a.data.addedAt).getTime())
    .map((item) => ({
      title: item.data.name,
      description: item.data.description,
      pubDate: new Date(item.data.addedAt),
      link: `${context.site}${item.data.category === 'mcp' ? 'mcps' : 'skills'}/${item.data.id}/`,
    }));

  return rss({
    title: 'R&D MCP Hub',
    description: '국내 R&D 연구자를 위한 MCP 서버 및 AI Skill 큐레이션',
    site: context.site!.toString(),
    items,
  });
}
```

- [ ] **Step 2: public/robots.txt 작성**

```
User-agent: *
Allow: /

Sitemap: https://junehawk.github.io/rndskills/sitemap-index.xml
```

- [ ] **Step 3: .github/workflows/deploy.yml 작성**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: .github/ISSUE_TEMPLATE/new-mcp-submission.yml 작성**

```yaml
name: 새 MCP/Skill 제보
description: 국내 R&D에 유용한 MCP 서버나 Skill을 알려주세요
labels: ["submission"]
body:
  - type: input
    id: name
    attributes:
      label: 이름
      description: MCP 서버 또는 Skill의 이름
      placeholder: "예: Korean Law MCP"
    validations:
      required: true
  - type: dropdown
    id: category
    attributes:
      label: 분류
      options:
        - MCP 서버
        - Skill
    validations:
      required: true
  - type: input
    id: repository
    attributes:
      label: 저장소 URL
      placeholder: "https://github.com/..."
    validations:
      required: true
  - type: textarea
    id: description
    attributes:
      label: 설명
      description: 이 도구가 무엇을 하는지, 왜 R&D 연구자에게 유용한지 간단히 설명해주세요
    validations:
      required: true
  - type: dropdown
    id: domain
    attributes:
      label: R&D 도메인
      multiple: true
      options:
        - 법률/정책
        - 공공데이터
        - 학술/논문
        - 과제관리/연구행정
        - 바이오/의료
        - 재료/화학
        - 환경/에너지
        - 특허/지재권
        - 개발도구
        - 자동화
        - 데이터분석
    validations:
      required: true
```

- [ ] **Step 5: 커밋**

```bash
cd /Users/junehawk/Research/rndskills
git add src/pages/rss.xml.ts public/robots.txt .github/
git commit -m "feat: RSS 피드 + robots.txt + GitHub Actions 배포 + Issue 템플릿"
```

---

## Task 11: 최종 빌드 검증 및 정리

**Files:**
- 전체 프로젝트

- [ ] **Step 1: 전체 빌드**

```bash
cd /Users/junehawk/Research/rndskills
pnpm build
```

Expected: 에러 없이 빌드 완료. dist/ 디렉토리에 정적 파일 생성.

- [ ] **Step 2: 빌드 결과 미리보기**

```bash
cd /Users/junehawk/Research/rndskills
pnpm preview
```

Expected: 모든 페이지 정상 렌더링. 네비게이션, 필터, 복사 버튼 동작 확인.

- [ ] **Step 3: 페이지별 점검 체크리스트**

- `/` — 히어로, MCP 설명, 추천 카드, 도메인 그리드, 최근 등록
- `/mcps/` — MCP 목록, 도메인 필터
- `/mcps/korean-law/` — 상세 정보, 설치 명령어 복사, MDX 본문
- `/skills/` — Skill 목록
- `/skills/omc-ultrawork/` — 상세 정보
- `/domains/law-policy/` — 도메인별 MCP + Skill 통합 뷰
- `/guides/` — 가이드 목록 (순서대로)
- `/guides/what-is-mcp/` — 가이드 상세 MDX 본문
- `/cases/` — 사례 목록 (외부 링크)
- `/about/` — 소개 페이지
- `/faq/` — FAQ 아코디언
- `/search/` — Pagefind 검색 (빌드 후 동작)
- `/rss.xml` — RSS 피드
- 모바일 반응형 확인

- [ ] **Step 4: 최종 커밋**

```bash
cd /Users/junehawk/Research/rndskills
git add -A
git commit -m "chore: 최종 빌드 검증 및 정리"
```

---

## 요약

| Task | 내용 | 예상 파일 수 |
|------|------|-------------|
| 1 | Astro 스캐폴딩 | 5 |
| 2 | Content Collections + 도메인 | 3 |
| 3 | BaseLayout + Header + Footer | 4 |
| 4 | 공통 UI 컴포넌트 | 5 |
| 5 | 샘플 콘텐츠 | 9 |
| 6 | MCP 페이지 + 레이아웃 | 4 |
| 7 | Skill, Guide, Cases, Domain 페이지 | 6 |
| 8 | 홈페이지 | 2 |
| 9 | About, FAQ, Search | 3 |
| 10 | RSS, robots, CI/CD, Issue 템플릿 | 4 |
| 11 | 최종 검증 | 0 |
| **총** | | **~45 파일** |
