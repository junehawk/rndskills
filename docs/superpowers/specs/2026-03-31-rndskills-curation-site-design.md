# R&D MCP/Skill 큐레이션 웹사이트 설계

## 1. 프로젝트 개요

국내 R&D 커뮤니티에 유용한 MCP 서버와 Claude Code Skill을 발굴, 큐레이션하여 모아두는 정적 웹사이트.

**MCP(Model Context Protocol)란?** AI 도구(Claude 등)가 외부 데이터와 서비스에 직접 접근할 수 있게 해주는 표준 프로토콜. 연구자 관점에서는 "AI에 플러그인을 꽂아서 법률 DB, 논문 DB, 공공데이터 등에 바로 연결하는 것"으로 이해하면 된다.

### 핵심 결정 사항

| 항목 | 결정 |
|------|------|
| **타겟 사용자** | 국가 R&D 연구자 중심 (AI 도구 비전문가 포함), 일반 개발자/연구자도 배제하지 않음 |
| **콘텐츠 범위** | MCP + Skills (MVP) → 워크플로우 레시피로 점진 확장 |
| **운영 모델** | 초기 수동 큐레이션 → 크롤링 후보 확보 + 수동 검증 후 등록 |
| **차별화** | 한국어 설명 + R&D 도메인별 분류 + 국내 데이터 생태계 특화 + 활용 사례 링크 + 연구자 눈높이 가이드 |
| **기술 스택** | Astro 5 + JSON/MDX + Tailwind CSS + GitHub Pages |
| **MVP 기준** | 도메인별 분류 + 검색 + 한국어 설명이 동작하는 사이트 배포 (10~20개 콘텐츠) |

---

## 2. 아키텍처

```
┌─────────────────────────────────────────────┐
│              GitHub Repository               │
│                                              │
│  content/          src/              public/ │
│  ├─ mcps/*.json    ├─ pages/         ├─ img │
│  ├─ mcps/*.mdx     ├─ components/          │
│  ├─ skills/*.json  ├─ layouts/             │
│  ├─ skills/*.mdx   └─ utils/               │
│  ├─ guides/*.json      └─ search.ts        │
│  ├─ guides/*.mdx                            │
│  ├─ cases/*.json                            │
│  └─ domains.json                            │
│                                              │
│  astro.config.ts   content.config.ts        │
└──────────────┬──────────────────────────────┘
               │ astro build
               ▼
┌──────────────────────┐    ┌─────────────────┐
│  Static Site (HTML)  │───▶│  GitHub Pages   │
│  + Pagefind 인덱스   │    │                 │
└──────────────────────┘    └─────────────────┘

향후 추가:
┌──────────────────────┐
│  크롤러 (GitHub      │──▶ content/*.json PR 자동 생성
│  Actions 스케줄)     │    → 수동 검토 후 머지
└──────────────────────┘
```

- **프레임워크**: Astro 5 + Content Collections (Zod 스키마 빌드 타임 검증)
- **스타일링**: Tailwind CSS 4
- **검색**: Pagefind (빌드 타임 인덱싱, 한국어 토크나이징 지원)
- **SEO**: meta 태그, Open Graph, sitemap.xml, robots.txt
- **RSS**: @astrojs/rss 피드 제공
- **빌드/배포**: GitHub Actions → GitHub Pages
- **패키지 매니저**: pnpm
- **TypeScript**: strict 모드

---

## 3. 데이터 스키마

모든 스키마는 `content.config.ts`에서 Zod로 정의하여 빌드 타임에 검증한다.

### 도메인 정의 (`content/domains.json`)

MVP에서는 4개 핵심 도메인에 집중, 나머지는 "준비 중"으로 표시.

```json
[
  {
    "id": "law-policy",
    "name": "법률/정책",
    "icon": "scale",
    "color": "#3B82F6",
    "priority": 1,
    "status": "active"
  },
  {
    "id": "public-data",
    "name": "공공데이터",
    "icon": "database",
    "color": "#10B981",
    "priority": 2,
    "status": "active"
  },
  {
    "id": "academic",
    "name": "학술/논문",
    "icon": "book-open",
    "color": "#8B5CF6",
    "priority": 3,
    "status": "active"
  },
  {
    "id": "research-admin",
    "name": "과제관리/연구행정",
    "icon": "clipboard-list",
    "color": "#F59E0B",
    "priority": 4,
    "status": "active"
  },
  {
    "id": "dev-tools",
    "name": "개발도구",
    "icon": "wrench",
    "color": "#6366F1",
    "priority": 5,
    "status": "upcoming"
  },
  {
    "id": "bio-medical",
    "name": "바이오/의료",
    "icon": "heart-pulse",
    "color": "#EF4444",
    "priority": 6,
    "status": "upcoming"
  },
  {
    "id": "materials",
    "name": "재료/화학",
    "icon": "flask",
    "color": "#06B6D4",
    "priority": 7,
    "status": "upcoming"
  },
  {
    "id": "environment",
    "name": "환경/에너지",
    "icon": "leaf",
    "color": "#22C55E",
    "priority": 8,
    "status": "upcoming"
  },
  {
    "id": "patent",
    "name": "특허/지재권",
    "icon": "file-badge",
    "color": "#A855F7",
    "priority": 9,
    "status": "upcoming"
  },
  {
    "id": "automation",
    "name": "자동화",
    "icon": "bot",
    "color": "#64748B",
    "priority": 10,
    "status": "upcoming"
  },
  {
    "id": "data-analysis",
    "name": "데이터분석",
    "icon": "bar-chart",
    "color": "#EC4899",
    "priority": 11,
    "status": "upcoming"
  }
]
```

### MCP 항목 (`content/mcps/*.json`)

```json
{
  "id": "korean-law",
  "name": "한국 법률 검색 MCP",
  "description": "한국 법령, 판례, 행정해석 등을 검색할 수 있는 MCP 서버",
  "benefits": "법령 검색에 수시간 걸리던 작업을 AI 대화로 수분 내 완료. 관련 판례까지 자동 연결.",
  "author": "junehawk",
  "repository": "https://github.com/...",
  "version": "1.0.0",
  "license": "MIT",
  "pricing": "free",
  "prerequisites": ["Claude Desktop 또는 Claude Code", "Node.js 18+"],
  "category": "mcp",
  "domains": ["law-policy", "public-data"],
  "tags": ["법령", "판례", "행정해석", "공공API"],
  "tools": ["search_law", "get_precedent", "search_precedents"],
  "status": "active",
  "installMethod": "npm",
  "installCommand": "npx @junehawk/korean-law-mcp",
  "compatibility": ["claude-desktop", "claude-code", "cursor"],
  "featured": true,
  "addedAt": "2026-03-31",
  "updatedAt": "2026-03-31",
  "cases": ["case-korean-law-research"]
}
```

### Skill 항목 (`content/skills/*.json`)

```json
{
  "id": "omc-ultrawork",
  "name": "OMC Ultrawork",
  "description": "병렬 에이전트 오케스트레이션으로 최대 성능 모드",
  "benefits": "복잡한 코딩 작업을 여러 AI 에이전트가 동시에 처리하여 작업 속도 대폭 향상.",
  "author": "oh-my-claudecode",
  "repository": "https://github.com/...",
  "version": "5.0.0",
  "license": "MIT",
  "pricing": "free",
  "prerequisites": ["Claude Code CLI"],
  "category": "skill",
  "domains": ["dev-tools", "automation"],
  "tags": ["claude-code", "병렬처리", "에이전트"],
  "platform": "claude-code",
  "installMethod": "plugin",
  "installCommand": "claude install oh-my-claudecode",
  "status": "active",
  "addedAt": "2026-03-31"
}
```

### 가이드 (`content/guides/*.json`)

```json
{
  "id": "getting-started-claude-desktop",
  "title": "Claude Desktop 설치부터 MCP 연결까지",
  "description": "AI 도구를 처음 접하는 연구자를 위한 시작 가이드",
  "difficulty": "beginner",
  "tags": ["시작하기", "설치", "Claude Desktop"],
  "order": 1,
  "addedAt": "2026-03-31"
}
```

상세 내용은 같은 id의 `.mdx` 파일로 작성.

### 활용 사례 (`content/cases/*.json`)

`type` enum: `"blog"` | `"video"` | `"paper"` | `"tutorial"`

```json
{
  "id": "case-korean-law-research",
  "title": "Korean Law MCP로 법률 리서치 자동화하기",
  "type": "blog",
  "url": "https://...",
  "author": "junehawk",
  "relatedItems": ["korean-law"],
  "language": "ko",
  "addedAt": "2026-03-31"
}
```

### 스키마 필드 설명

- `author`: MCP/Skill 원작자. 큐레이터 추적(`curatedBy`)은 다중 관리자 체계 도입 시 추가.
- `version`: MCP/Skill의 큐레이션 시점 버전.
- `license`: 오픈소스 라이선스. R&D 기관 도입 판단에 필수.
- `pricing`: `"free"` | `"freemium"` | `"paid"`. 도구 자체 비용 (Claude 구독은 별도).
- `prerequisites`: 사용에 필요한 선행 조건 목록. 연구자가 "내가 뭘 먼저 해야 하나" 판단에 사용.
- `benefits`: 연구자 관점의 구체적 효용. "이걸 쓰면 뭐가 달라지는가"에 대한 답.
- `tools`: MCP가 제공하는 도구 목록. 사용자가 기능을 파악하는 핵심 정보.
- `domains`: `content/domains.json`의 id를 참조.

---

## 4. 페이지 구조

```
/                          → 홈 (히어로 + "MCP란?" 설명 + 추천 항목 + 도메인 그리드)
/about                     → 소개 (운영 주체, 큐레이션 기준, 연락처)
/mcps                      → MCP 서버 목록 (도메인별 필터, 검색)
/mcps/[id]                 → MCP 상세 (설명, 효용, 설치법, 호환성, 관련 사례, 설치 명령어 복사)
/skills                    → Skill 목록 (도메인별 필터, 검색)
/skills/[id]               → Skill 상세
/domains/[id]              → 도메인별 랜딩 (해당 도메인의 MCP + Skill + 가이드 통합 뷰)
/guides                    → 시작하기 가이드 목록 (난이도순 정렬)
/guides/[id]               → 가이드 상세 (MDX 본문)
/cases                     → 활용 사례 목록 (블로그/영상 링크 → 외부 링크로 직접 이동)
/faq                       → 자주 묻는 질문 (비용, 보안, 기관 네트워크, 설치환경 등)
/search                    → 통합 검색 (MCP + Skill + 가이드 + 사례)
```

사례(`/cases`)는 상세 페이지 없이 외부 링크로 바로 이동한다.

### 네비게이션

```
[로고: R&D MCP Hub]  시작하기 | MCP서버 | Skills | 사례 | FAQ | [검색]
```

"시작하기"(가이드)를 맨 앞에 배치하여 AI 도구를 처음 접하는 연구자가 바로 진입할 수 있도록 한다.

### 홈페이지 구성

1. 히어로 — "국내 R&D를 위한 AI 도구 확장 모음"
   - 부제: "MCP와 Skill로 법률 검색, 논문 분석, 공공데이터 활용을 AI로 자동화하세요"
   - "MCP가 뭔가요?" 30초 설명 링크 또는 인라인 설명
2. "처음이신가요?" 섹션 — 시작하기 가이드 CTA (가이드 페이지로 연결)
3. 추천 항목 (featured) 카드 3~4개 (benefits 문구 노출)
4. 도메인별 바로가기 (아이콘 그리드 → `/domains/[id]`로 연결)
5. 최근 등록 항목

### 목록 페이지 공통

- 도메인 필터 (사이드바 또는 상단 탭)
- 태그 필터
- Pagefind 검색
- 카드형 레이아웃
- 설치 명령어 원클릭 복사 (상세 페이지)

---

## 5. 디렉토리 구조

```
rndskills/
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── faq.astro
│   │   ├── mcps/
│   │   │   ├── index.astro
│   │   │   └── [id].astro
│   │   ├── skills/
│   │   │   ├── index.astro
│   │   │   └── [id].astro
│   │   ├── domains/
│   │   │   └── [id].astro
│   │   ├── guides/
│   │   │   ├── index.astro
│   │   │   └── [id].astro
│   │   ├── cases/
│   │   │   └── index.astro
│   │   └── search.astro
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Card.astro
│   │   ├── DomainFilter.astro
│   │   ├── DomainGrid.astro
│   │   ├── SearchBar.astro
│   │   ├── TagList.astro
│   │   ├── CopyButton.astro
│   │   └── HeroExplainer.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── ListLayout.astro
│   │   └── DetailLayout.astro
│   └── utils/
│       └── search.ts
├── content/
│   ├── domains.json
│   ├── mcps/
│   ├── skills/
│   ├── guides/
│   └── cases/
├── content.config.ts
├── astro.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── CLAUDE.md
└── .github/
    ├── ISSUE_TEMPLATE/
    │   └── new-mcp-submission.yml
    └── workflows/
        └── deploy.yml
```

---

## 6. 콘텐츠 워크플로우

### 현재 (MVP) — 수동 큐레이션

```
JSON + MDX 작성 → git push → GitHub Actions 빌드 → GitHub Pages 배포
```

### 커뮤니티 제보 (MVP)

```
GitHub Issue 템플릿("새 MCP 제보") → 관리자 검토 → JSON 작성 후 등록
```

### 향후 — 반자동 크롤링

```
크롤러(GitHub Actions cron)
  → GitHub, npm, MCP 레지스트리 등에서 후보 수집
  → 후보 JSON 생성 + PR 자동 생성
  → 관리자가 내용 확인/수정
  → 머지 → 자동 빌드/배포
```

---

## 7. MVP 가이드 계획

연구자의 기술 수준을 고려한 단계별 가이드:

1. **"AI 도구와 MCP, 왜 연구에 필요한가?"** (개념, 0단계)
   - MCP를 "AI에 플러그인을 꽂는 것"으로 비유하여 설명
   - 기존 도구(국가법령정보센터 등) 대비 이점을 구체적으로 보여줌
2. **"Claude Desktop 설치부터 첫 MCP 연결까지"** (실습, 1단계)
   - 스크린샷 포함, macOS/Windows 모두 안내
   - Node.js 설치, Claude 계정 생성, 결제 설정까지 포함
3. **"연구자를 위한 FAQ: 비용, 보안, 기관 네트워크"** (현실 장벽, 2단계)
   - Claude Pro 비용 ($20/월), 무료 범위, 연구비 비목 처리 팁
   - 기관 네트워크 제한 시 대안
   - 연구 데이터 보안 주의사항

---

## 8. /about 페이지 내용

- **운영 주체**: KISTI 소속 연구자 (개인 프로젝트)
- **사이트 목적**: 국내 R&D 커뮤니티에 유용한 AI 도구 확장을 발굴하고 한국어로 소개
- **큐레이션 기준**:
  - 오픈소스 또는 명확한 라이선스
  - 한국 R&D에 실질적 유용성
  - 설치/사용이 검증됨 (직접 테스트)
  - 보안 관점에서 명백한 위험이 없음
- **featured 선정 기준**: 직접 사용 경험 + R&D 적합성 + 완성도
- **연락처**: GitHub Issues, 이메일

---

## 9. /faq 페이지 주요 항목

**비용:**
- Claude Desktop Pro: 월 $20 (약 27,000원)
- Claude Code: API 종량제 (사용량에 따라 과금)
- MCP 서버 자체는 대부분 무료 오픈소스
- 연구비 처리: 소프트웨어 사용료 / 클라우드 서비스 비목으로 가능

**보안:**
- MCP는 로컬에서 실행되며, AI 모델에 데이터를 전달하는 중개 역할
- 민감한 연구 데이터(미공개 논문, 개인정보, 국가과제 보안 자료)는 AI에 입력하지 말 것
- 각 MCP의 데이터 처리 방식은 상세 페이지에서 확인

**기관 네트워크:**
- npm 설치가 방화벽에서 차단될 경우: 프록시 설정 또는 오프라인 설치 안내
- Claude API 접속 제한 시: IT 부서에 api.anthropic.com 화이트리스트 요청

**설치 환경:**
- Node.js 18+ 필요 (설치 가이드 링크)
- 관리자 권한 없이 설치 가능 (nvm 사용)
- Windows/macOS 모두 지원

---

## 10. MVP 범위

### MVP 우선 도메인 (4개)

1. **법률/정책** — korean-law MCP 등 직접 운영 경험 보유
2. **공공데이터** — 한국 공공데이터포털 API 연계 MCP
3. **학술/논문** — PubMed, 학술 DB MCP
4. **과제관리/연구행정** — NTIS, 연구비 정산, 성과 보고서 관련 도구

나머지 7개 도메인은 "준비 중"으로 표시.

### 포함

- 홈페이지 (MCP 개념 설명 포함), /about, /faq
- MCP 목록/상세, Skill 목록/상세, 도메인별 랜딩
- 가이드 목록/상세 (3편: 개념, 실습, FAQ)
- 사례 목록, 통합 검색
- 도메인별 필터 + 태그 필터 + Pagefind 검색
- 설치 명령어 원클릭 복사
- 초기 콘텐츠 10~20개 (직접 큐레이션, 4개 도메인 집중)
- GitHub Pages 배포 + GitHub Actions CI/CD
- SEO 기본 (meta, OG, sitemap.xml, robots.txt)
- RSS 피드 (@astrojs/rss)
- GitHub Issue 템플릿 (새 MCP 제보)
- 반응형 디자인 (모바일 대응)

### 미포함 (향후)

- 크롤링 파이프라인
- 사용자 인증/제출 기능
- 영어 다국어 지원
- 댓글/평점 시스템
- MCP별 상세 보안 감사 (`dataHandling`, `securityNote` 필드)
- Pretext 활용 UI 텍스트 레이아웃 최적화 검토 (chenglou/pretext)

---

## 11. 참고

- 기존 유사 서비스: [MCP.so](https://mcp.so), [Smithery](https://smithery.ai), [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)
- 직접 운영 중인 MCP: korean-law, kisti-vectordb, Atlassian
