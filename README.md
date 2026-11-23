# 비공식듀오 MVP

레드크리스탈 중매사가 엄선한 소개팅 프로필. Next.js + Supabase + Vercel.

## 기능
- 로그인 없이 남성/여성 공개 프로필 목록과 상세 보기
- 관리자 이메일 로그인, 프로필 등록/수정/삭제, 사진 업로드, 공개/비공개
- 모바일 반응형

## 시작
1. Node.js 20 이상 설치 후 `npm install`
2. Supabase 새 프로젝트 생성 → SQL Editor에서 `supabase/schema.sql` 실행
3. Supabase Authentication > Users에서 관리자 이메일 계정 생성. 이메일 인증 완료 확인
4. 해당 사용자의 UUID로 SQL Editor에서 `insert into public.admins(user_id) values ('UUID');` 실행
5. `.env.example`을 `.env.local`로 복사하고 프로젝트 URL과 publishable/anon key 입력. **service_role 키를 절대 넣지 마세요.**
6. `npm run dev` → http://localhost:3000 / 관리자 http://localhost:3000/admin
7. GitHub 저장소에 올리고 Vercel에서 Import Project. 환경 변수 2개를 Vercel에 등록 후 Deploy

## 운영 및 보안 참고
- 관리자 회원가입 페이지는 없습니다. Supabase에서 관리자 계정을 직접 생성하고 `admins` 테이블에 승인합니다.
- 공개 프로필과 공개 Storage 버킷의 사진은 누구나 열람할 수 있습니다. 업로드 전에 사진/정보 공개 동의를 반드시 확보하세요.
- 비공개 전환 시 DB 목록/상세 조회는 차단되지만 **이미 발급된 공개 사진 URL은 계속 접근 가능**합니다. 공개 취소/삭제 요청 시 Storage에서 원본 파일도 별도로 삭제해야 합니다. 운영 전 비공개 사진 버킷 + 서명 URL 또는 서버 프록시로 개선을 권장합니다.
- 파일 제거 버튼은 프로필 연결만 제거하며 Storage 원본은 삭제하지 않습니다. 운영 시 스토리지 정리 기능을 추가하세요.
- 공개 프로필은 검색 엔진에도 노출될 수 있습니다. 필요한 경우 robots 정책 및 접근 제어를 추가하세요.
- 서비스 출시 전 개인정보 처리방침, 보유기간, 동의 철회 및 삭제 절차, 관리자 권한/접근 기록을 정비하세요.
- 프로필 삭제는 DB에서 즉시 삭제되며 복구 기능은 없습니다.
- Vercel Hobby 요금제는 상업적 사용 조건을 확인하고 적절한 요금제를 선택하세요.

## 관리자 셀프 회원가입 + 대표 승인 (추가)
1. 기존 `supabase/schema.sql`을 먼저 실행하고, `supabase/admin-approval.sql`을 SQL Editor에서 실행합니다. 이미 운영 중인 프로젝트라면 기존 데이터 백업 후 실행하세요.
2. Supabase Authentication > Providers > Email에서 이메일 회원가입을 활성화하고, 이메일 인증 및 Site URL / Redirect URLs를 배포 주소에 맞춰 설정합니다.
3. 최초 대표 관리자도 `/admin`에서 회원가입합니다. 이메일 인증이 켜져 있으면 인증 후 로그인해 가입 신청을 완료합니다.
4. **최초 1회만** Supabase Authentication > Users에서 대표의 UUID를 확인하고, SQL Editor에서 다음 SQL을 실행합니다. 일반 회원에게 이 작업을 허용하지 마세요.
   ```sql
   insert into public.admin_requests(user_id,display_name,status,role)
   values ('대표_AUTH_USER_UUID','대표 관리자','approved','owner')
   on conflict (user_id) do update set status='approved',role='owner';
   ```
5. 이후 추가 관리자는 `/admin`에서 직접 회원가입하고 이메일 인증 후 로그인해 가입 신청합니다. 대표는 관리자 화면의 `관리자 가입 승인`에서 승인/거절할 수 있습니다.
6. `public.is_admin()`이 승인된 관리자만 참을 반환하므로 프로필 변경 및 사진 업로드는 미승인 계정에게 RLS로 차단됩니다. 대표 승인 RPC는 `is_owner()`를 검사합니다.

**주의:** 공개 프로필과 공개 Storage 버킷의 사진은 링크를 아는 누구나 접근할 수 있습니다. 사진 및 개인정보 공개 동의를 확보하세요. 기존 `admins` 테이블은 신규 승인 로직에서 사용하지 않습니다. 실제 운영 전 이메일 인증, 대표 초기 지정, 승인/거절, 비승인 쓰기 차단, 업로드를 테스트하세요.
