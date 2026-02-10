# AWS Amplify 배포 체크리스트 (Step 1)

> 마인드피티 프론트엔드를 AWS Amplify Hosting에 배포하기 위한 콘솔 작업 가이드

---

## 사전 확인

- [x] `amplify.yml` 프로젝트 루트에 존재
- [x] `next.config.ts` → `output: 'standalone'` 설정 완료
- [x] `npm run build` 로컬 성공 확인 (0 errors)
- [x] 프로덕션 서버 전 라우트 200 OK 확인

---

## 1. Amplify 콘솔 접속

1. AWS 콘솔 → **AWS Amplify** 서비스 이동
2. **New app** → **Host web app** 클릭

## 2. Git 리포지토리 연결

1. **GitHub** 선택 → 권한 승인
2. 리포지토리: `mindpt-frontend` 선택
3. 브랜치: `main` 선택
4. **Next** 클릭

## 3. 빌드 설정 확인

- Amplify가 `amplify.yml`을 자동 감지합니다
- **Framework**: Next.js - SSR 로 표시되는지 확인
- 빌드 설정이 아래와 일치하는지 확인:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 18
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

## 4. 환경 변수 설정

| 변수명 | 값 | 비고 |
|--------|-----|------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-api-domain.com` | 백엔드 API 주소 (현재 마케팅 페이지는 API 미사용) |

> **참고**: 마케팅/데모 페이지(`/`, `/demo/*`)는 API를 호출하지 않으므로,
> 환경 변수 없이도 마케팅 페이지는 정상 작동합니다.
> 추후 튜터/챗 기능 배포 시 반드시 설정해야 합니다.

## 5. 고급 설정 (Advanced settings)

- **Node.js 버전**: 18 (amplify.yml의 `nvm use 18`으로 처리됨)
- **플랫폼**: Amazon Linux 2023 (기본값 사용)
- **SSR 로그**: CloudWatch 활성화 권장

## 6. 배포 실행

1. **Save and deploy** 클릭
2. 빌드 로그에서 아래 단계가 순차 완료되는지 확인:
   - `Provision` → `Build` → `Deploy` → `Verify`
3. 배포 완료 후 제공되는 `*.amplifyapp.com` URL로 접속 확인

## 7. 배포 후 검증

- [ ] `/` (홈) 페이지 정상 렌더링
- [ ] `/demo` 페이지 정상 렌더링
- [ ] `/demo/lesson`, `/demo/counsel`, `/demo/nag`, `/demo/mandalart` 정상 접속
- [ ] 이미지 (hero.jpg, service.jpg, demo.jpg) 정상 로딩
- [ ] 모바일 반응형 정상 작동
- [ ] TopNav 링크 정상 동작

## 8. 커스텀 도메인 연결 (선택)

1. Amplify 콘솔 → **Domain management**
2. **Add domain** → 도메인 입력
3. DNS 설정 (CNAME 또는 Route 53) 안내에 따라 설정
4. SSL 인증서 자동 발급 완료 대기 (최대 30분)

---

## 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| 빌드 실패 `nvm: command not found` | Node 버전 문제 | Amplify 콘솔 Build settings에서 Node 18 지정 |
| 페이지 404 | SSR 미감지 | Framework를 "Next.js - SSR"로 수동 선택 |
| 이미지 깨짐 | next/image 도메인 미허용 | 외부 이미지 사용 시 `next.config.ts`에 domains 추가 |
| API 호출 실패 | 환경 변수 미설정 | `NEXT_PUBLIC_API_BASE_URL` 환경 변수 설정 |
