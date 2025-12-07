# JuuxHair Flutter → React Migration Plan

## Project Overview
- **Source**: Flutter Web (juuxhair/hairfit_app)
- **Target**: React + TypeScript (juuxhair2)
- **Backend**: FastAPI (기존 유지 - juuxhair/hairfit_server)

## Tech Stack (React)
| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Routing | React Router v6 |
| State Management | Zustand |
| Data Fetching | TanStack Query (React Query) |
| HTTP Client | Axios |
| UI Framework | Material-UI (MUI) v5 |
| Forms | React Hook Form |
| Styling | Emotion (MUI default) |
| Icons | MUI Icons |
| Auth | @react-oauth/google |

---

## Migration Phases

### Phase 1: Project Initialization ✅
**Status**: COMPLETED
**Files created**:
- [x] package.json
- [x] vite.config.ts
- [x] tsconfig.json
- [x] tsconfig.node.json
- [x] index.html
- [x] src/main.tsx
- [x] src/App.tsx
- [x] src/vite-env.d.ts
- [x] .env.example

---

### Phase 2: Core Infrastructure ✅
**Status**: COMPLETED

#### 2.1 Directory Structure ✅
```
src/
├── components/
│   └── common/
├── features/
│   ├── auth/
│   ├── crm/
│   ├── camera/
│   ├── gallery/
│   └── admin/
├── hooks/
├── services/
├── store/
├── types/
├── utils/
└── theme/
```

#### 2.2 Files created:
- [x] src/services/api.ts (Axios instance with interceptors)
- [x] src/store/authStore.ts (Zustand auth store)
- [x] src/store/uiStore.ts (UI state - tab index, etc.)
- [x] src/theme/index.ts (MUI theme configuration)
- [x] src/types/index.ts (TypeScript interfaces)
- [x] src/utils/storage.ts (localStorage helpers)
- [x] src/components/common/Layout.tsx (Main layout with bottom nav)

---

### Phase 3: Authentication Feature ✅
**Status**: COMPLETED

**API Endpoints** (from existing backend):
- POST `/register` - Email registration
- POST `/login` - Email login
- POST `/login/google` - Google OAuth
- POST `/refresh` - Token refresh
- POST `/logout` - Logout
- GET `/users/me` - Current user

**Files created**:
- [x] src/features/auth/api.ts
- [x] src/features/auth/components/LoginForm.tsx
- [x] src/features/auth/components/RegisterForm.tsx
- [x] src/features/auth/components/GoogleLoginButton.tsx
- [x] src/features/auth/pages/LoginPage.tsx
- [x] src/hooks/useAuth.ts

---

### Phase 4: CRM Feature (Members) ✅
**Status**: COMPLETED

**API Endpoints**:
- GET `/members` - List members
- POST `/members` - Create member
- PUT `/members/{id}` - Update member
- DELETE `/members/{id}` - Delete member

**Files created**:
- [x] src/features/crm/api.ts
- [x] src/features/crm/hooks/useMembers.ts
- [x] src/features/crm/components/MemberCard.tsx
- [x] src/features/crm/components/MemberForm.tsx
- [x] src/features/crm/components/SearchBar.tsx
- [x] src/features/crm/pages/CrmPage.tsx
- [x] src/features/crm/pages/MemberDetailPage.tsx
- [x] src/features/crm/pages/AddMemberPage.tsx

---

### Phase 5: Camera/Synthesis Feature ✅
**Status**: COMPLETED

**API Endpoints**:
- POST `/synthesize` - AI synthesis (multipart)
- POST `/upload/result-photo` - Upload result
- GET `/synthesis-history` - Get history
- POST `/synthesis-history` - Create history

**Files created**:
- [x] src/features/camera/api.ts
- [x] src/features/camera/store/cameraStore.ts
- [x] src/features/camera/hooks/useSynthesis.ts
- [x] src/features/camera/components/ImageSourceSelector.tsx
- [x] src/features/camera/components/StyleCarousel.tsx
- [x] src/features/camera/pages/CameraPage.tsx
- [x] src/features/camera/pages/ResultPage.tsx

---

### Phase 6: Gallery Feature ✅
**Status**: COMPLETED

**Files created**:
- [x] src/features/gallery/api.ts
- [x] src/features/gallery/hooks/useGallery.ts
- [x] src/features/gallery/components/GalleryGrid.tsx
- [x] src/features/gallery/components/GalleryItem.tsx
- [x] src/features/gallery/pages/GalleryPage.tsx
- [x] src/features/gallery/pages/GalleryDetailPage.tsx

---

### Phase 7: Admin Feature (Styles) ✅
**Status**: COMPLETED

**API Endpoints**:
- GET `/styles` - List styles
- POST `/styles` - Upload style
- DELETE `/styles/{id}` - Delete style

**Files created**:
- [x] src/features/admin/api.ts
- [x] src/features/admin/hooks/useStyles.ts
- [x] src/features/admin/components/StyleGrid.tsx
- [x] src/features/admin/components/AddStyleDialog.tsx
- [x] src/features/admin/pages/AdminPage.tsx

---

### Phase 8: Testing & Polish ⬜
**Status**: NOT STARTED

- [ ] npm install 실행
- [ ] TypeScript 컴파일 에러 수정
- [ ] Responsive design check (max-width: 480px)
- [ ] Error handling & toast notifications
- [ ] Loading states 확인
- [ ] Empty states 확인
- [ ] Token refresh flow test
- [ ] Build & deploy test

---

## API Base URL Configuration
```
Development: http://127.0.0.1:8000
Production: (configure in .env)
```

## Color Theme (from Flutter)
```typescript
const theme = {
  primary: '#000000',      // Black
  secondary: '#9C27B0',    // Purple
  surface: '#FFFFFF',      // White
  background: '#FAFAFA',   // Light grey
}
```

---

## Progress Tracking

| Phase | Status | Completion Date |
|-------|--------|-----------------|
| Phase 1 | ✅ Completed | 2024-12-06 |
| Phase 2 | ✅ Completed | 2024-12-06 |
| Phase 3 | ✅ Completed | 2024-12-06 |
| Phase 4 | ✅ Completed | 2024-12-06 |
| Phase 5 | ✅ Completed | 2024-12-06 |
| Phase 6 | ✅ Completed | 2024-12-06 |
| Phase 7 | ✅ Completed | 2024-12-06 |
| Phase 8 | ⬜ Not Started | - |

---

## Resume Instructions

토큰 소진 시 다음 단계부터 재개:
1. 이 MIGRATION_PLAN.md 파일 확인
2. Progress Tracking 테이블에서 마지막 완료 Phase 확인
3. 해당 Phase의 체크리스트에서 미완료 항목부터 진행

### 현재 상태 (2024-12-06)
- **Phase 1-7 완료**: 모든 핵심 기능 코드 작성 완료
- **Phase 8 대기중**: npm install 및 테스트 필요

### 다음 단계
```bash
cd /project/juuxhair/juuxhair2
npm install
npm run dev
```

---

## File Structure Summary

```
juuxhair2/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── index.html
├── .env.example
├── MIGRATION_PLAN.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── vite-env.d.ts
    ├── components/
    │   └── common/
    │       └── Layout.tsx
    ├── features/
    │   ├── auth/
    │   │   ├── api.ts
    │   │   ├── components/
    │   │   │   ├── LoginForm.tsx
    │   │   │   ├── RegisterForm.tsx
    │   │   │   └── GoogleLoginButton.tsx
    │   │   └── pages/
    │   │       └── LoginPage.tsx
    │   ├── crm/
    │   │   ├── api.ts
    │   │   ├── hooks/
    │   │   │   └── useMembers.ts
    │   │   ├── components/
    │   │   │   ├── MemberCard.tsx
    │   │   │   ├── MemberForm.tsx
    │   │   │   └── SearchBar.tsx
    │   │   └── pages/
    │   │       ├── CrmPage.tsx
    │   │       ├── AddMemberPage.tsx
    │   │       └── MemberDetailPage.tsx
    │   ├── camera/
    │   │   ├── api.ts
    │   │   ├── store/
    │   │   │   └── cameraStore.ts
    │   │   ├── hooks/
    │   │   │   └── useSynthesis.ts
    │   │   ├── components/
    │   │   │   ├── ImageSourceSelector.tsx
    │   │   │   └── StyleCarousel.tsx
    │   │   └── pages/
    │   │       ├── CameraPage.tsx
    │   │       └── ResultPage.tsx
    │   ├── gallery/
    │   │   ├── api.ts
    │   │   ├── hooks/
    │   │   │   └── useGallery.ts
    │   │   ├── components/
    │   │   │   ├── GalleryGrid.tsx
    │   │   │   └── GalleryItem.tsx
    │   │   └── pages/
    │   │       ├── GalleryPage.tsx
    │   │       └── GalleryDetailPage.tsx
    │   └── admin/
    │       ├── api.ts
    │       ├── hooks/
    │       │   └── useStyles.ts
    │       ├── components/
    │       │   ├── StyleGrid.tsx
    │       │   └── AddStyleDialog.tsx
    │       └── pages/
    │           └── AdminPage.tsx
    ├── hooks/
    │   └── useAuth.ts
    ├── services/
    │   └── api.ts
    ├── store/
    │   ├── authStore.ts
    │   └── uiStore.ts
    ├── theme/
    │   └── index.ts
    ├── types/
    │   └── index.ts
    └── utils/
        └── storage.ts
```

---

## Notes
- Backend (hairfit_server)는 수정 없이 그대로 사용
- Flutter 코드는 UI 참조용으로만 활용
- 로컬 DB (Drift/SQLite)는 React에서 IndexedDB 또는 localStorage로 대체 가능
  (MVP에서는 서버 동기화만 구현, 오프라인 기능은 추후 추가)
