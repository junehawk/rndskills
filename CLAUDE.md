# R&D MCP/Skill 큐레이션 웹사이트 (rndskills)

국내 R&D 커뮤니티를 위한 MCP 서버 및 Claude Code Skill 큐레이션 정적 웹사이트.

## 기술 스택

- **프레임워크**: Astro 6 + Content Collections (Zod 스키마 검증)
- **스타일링**: Tailwind CSS (via @astrojs/tailwind)
- **검색**: Pagefind (빌드 타임 인덱싱, 한국어 지원)
- **빌드/배포**: GitHub Actions → GitHub Pages
- **패키지 매니저**: pnpm
- **TypeScript**: strict 모드

## 프로젝트 구조

```
rndskills/
├── src/
│   ├── pages/          # Astro 페이지 라우팅
│   ├── components/     # UI 컴포넌트 (.astro)
│   ├── layouts/        # 페이지 레이아웃
│   └── utils/          # 유틸리티 (검색 등)
├── content/            # 콘텐츠 데이터
│   ├── domains.json    # R&D 도메인 정의
│   ├── mcps/           # MCP 항목 (*.json + *.mdx)
│   ├── skills/         # Skill 항목 (*.json + *.mdx)
│   ├── guides/         # 시작하기 가이드 (*.json + *.mdx)
│   └── cases/          # 활용 사례 (*.json)
├── content.config.ts   # Content Collections Zod 스키마
├── astro.config.ts     # Astro 설정
└── tailwind.config.ts  # Tailwind 설정
```

## 명령어

```bash
pnpm install          # 의존성 설치
pnpm dev              # 개발 서버 (localhost:4321)
pnpm build            # 프로덕션 빌드
pnpm preview          # 빌드 결과 미리보기
```

## 콘텐츠 작성 규칙

### JSON 스키마

- MCP/Skill 항목: `id`, `name`, `description`, `benefits`, `author`, `version`, `license`, `pricing`, `prerequisites`, `domains`, `tags` 필수
- MCP 추가 필수: `tools`, `installMethod`, `installCommand`, `compatibility`
- `domains` 값은 `content/domains.json`의 id를 참조
- `pricing`: `"free"` | `"freemium"` | `"paid"`
- `status`: `"active"` | `"deprecated"` | `"beta"`

### MDX 상세 설명

- JSON과 같은 id로 `.mdx` 파일 작성 (선택사항)
- 한국어로 작성, 연구자 눈높이의 평이한 문체
- 기술 용어는 최초 등장 시 간단히 설명

## 코딩 컨벤션

- 컴포넌트: PascalCase (e.g., `DomainGrid.astro`)
- 유틸리티: camelCase (e.g., `search.ts`)
- 콘텐츠 파일: kebab-case (e.g., `korean-law.json`)
- 커밋 메시지: 한국어 또는 영어, conventional commits 형식
- Astro 컴포넌트 우선, React/Vue는 인터랙티브가 필요한 경우에만 사용

## 타겟 사용자

국가 R&D 연구자 중심 (AI 도구 비전문가 포함). 콘텐츠와 UI 모두 비개발자 연구자가 이해할 수 있는 수준으로 작성.

## 설계 문서

`docs/superpowers/specs/2026-03-31-rndskills-curation-site-design.md` 참조.
