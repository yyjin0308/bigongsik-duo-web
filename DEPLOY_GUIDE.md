# 비공식듀오 PC 중심 웹사이트 배포

## 왜 기존 배포가 실패했나?
GitHub에 업로드된 `index.html`, `index.js`, `api/`, `vercel.json` 구조는 이 ZIP에 포함된 Next.js 프로젝트와 다릅니다. 기존 Vercel 설정은 Other 및 Output Directory 지정으로 되어 있어 Next.js 배포에 맞지 않습니다.

## 올바른 배포
1. 기존 GitHub 저장소를 백업합니다. 기존 파일을 무작정 덮어쓰지 말고 **새 저장소** `bigongsik-duo-web`를 만드는 것이 안전합니다.
2. 이 ZIP의 `bigongsik-duo-desktop` 폴더 **안에 있는 파일과 폴더**를 새 저장소 루트에 올립니다. `app/`, `lib/`, `supabase/`, `package.json`, `next.config.ts`가 루트에 있어야 합니다.
3. Vercel → Add New → Project → 새 저장소 Import.
4. Framework Preset **Next.js**, Root Directory `./`, Build/Output/Install Override 모두 OFF.
5. 환경변수 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 실제 Supabase 프로젝트 값으로 설정합니다.
6. Deploy를 실행합니다. 기존 Supabase의 SQL이 이 프로젝트 스키마와 일치해야 합니다.
7. 관리자 승인 설정은 `README.md`를 확인합니다. 최초 owner는 Supabase SQL로 1회 설정해야 합니다.

주의: 프로필은 공개되므로 사진 및 개인 정보 공개 동의를 받은 뒤 게시하세요. 서비스 운영 전 보안/권한 정책을 테스트하세요.
