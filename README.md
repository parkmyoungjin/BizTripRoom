# 출장 정보 공유 시스템

실시간으로 출장 정보를 공유하고 소통할 수 있는 웹 애플리케이션입니다.

## 📋 프로젝트 소개

출장 참석자들이 일정, 참석자 정보를 확인하고 실시간으로 소통할 수 있는 웹 애플리케이션입니다.

## ✨ 주요 기능

- 📊 **실시간 데이터 동기화**: Vercel KV를 사용한 실시간 데이터 공유
- 💬 **실시간 채팅**: 질문과 답변 시스템
- 👥 **참석자 관리**: 참석자 추가/삭제 및 확인 상태 관리
- 📅 **일정 관리**: 출장 일정 생성 및 관리
- 🔐 **관리자 페이지**: 비밀번호로 보호되는 관리 기능
- **📱 모바일 최적화**: 반응형 디자인으로 모든 기기에서 사용 가능

## 🚀 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Vercel KV (Redis)
- **Deployment**: Vercel

## 📦 설치 및 실행

### 1. 환경변수 설정

개발 환경에서 Vercel KV를 사용하려면 환경변수를 설정해야 합니다:

```bash
# .env.local 파일 생성
cp .env.example .env.local
```

`.env.local` 파일에 다음 내용을 추가:
```bash
# Vercel KV 환경변수 (Vercel 대시보드에서 복사)
KV_REST_API_URL=your-kv-rest-api-url
KV_REST_API_TOKEN=your-kv-rest-api-token
KV_REST_API_READ_ONLY_TOKEN=your-kv-read-only-token
```

### 2. 개발 환경에서 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 🔧 사용 방법

### 메인 페이지
- 출장 정보, 일정표, 참석자 목록 확인
- 질문 작성 및 답변 기능

### 관리자 페이지
- 관리자 페이지(`/admin`)에서 로그인
- 출장 정보, 참석자, 채팅 관리
- 변경사항은 즉시 모든 사용자에게 반영

## 📱 주요 화면

### 가로 타임라인
- 시간 순서대로 배치된 활동 카드
- 각 활동별 색상 코딩 및 이모지
- 모바일에서 가로 스크롤 지원

### 관리자 기능
- 실시간 데이터 동기화
- 직관적인 편집 인터페이스
- 색상 및 이모지 커스터마이징

## 🌐 배포

이 프로젝트는 Vercel에 최적화되어 있습니다.

### Vercel 배포 가이드
1. GitHub에 코드 업로드
2. Vercel 계정으로 로그인
3. GitHub 저장소 연결
4. 자동 배포 완료

### 1. GitHub에 코드 업로드

```bash
git add .
git commit -m "Vercel KV 적용 완료"
git push origin main
```

### 2. Vercel 대시보드에서 프로젝트 생성

1. [Vercel 대시보드](https://vercel.com/dashboard)에 접속
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 선택 후 Import

### 3. Vercel KV 스토어 생성

1. 프로젝트 대시보드에서 "Storage" 탭 클릭
2. "Create Database" → "KV" 선택
3. 데이터베이스 이름 입력 후 생성
4. 환경 변수가 자동으로 설정됨 (`KV_REST_API_URL`, `KV_REST_API_TOKEN`)

### 4. 배포 확인

- 배포가 완료되면 자동으로 도메인이 할당됩니다
- 여러 사용자가 동시에 접속하여 실시간 데이터 공유를 테스트할 수 있습니다

## 📂 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx          # 메인 페이지
│   ├── admin/
│   │   └── page.tsx      # 관리자 페이지
│   ├── globals.css       # 전역 스타일
│   └── layout.tsx        # 레이아웃 컴포넌트
public/                   # 정적 파일
```

## 🔒 보안 주의사항

- 관리자 비밀번호는 개발용으로, 실제 운영시에는 보안 강화 필요
- localStorage 사용으로 데이터가 브라우저에 저장됨

## 📄 라이선스

MIT License

---

Made with ❤️ for better business trip management
