
## Docker 환경에서 실행하기

### 1. Docker로 전체 서비스 실행

아래 명령어로 NestJS 서버와 PostgreSQL DB를 한 번에 실행할 수 있습니다.

```bash
# 빌드 및 실행 (최초 실행 또는 코드 변경 시)
docker-compose -f docker-compose-test.yml up --build

# 백그라운드 실행
docker-compose -f docker-compose-test.yml up -d

# 모든 컨테이너 및 볼륨 정리(데이터 초기화)
docker-compose -f docker-compose-test.yml down -v
```

### 2. docker-compose-test.yml 실행 시 동작
- PostgreSQL 16.8-alpine 컨테이너가 5435 포트(로컬)로 기동됩니다.
  - DB 정보: user=test_user, password=test_password, db=wait_but_chat
- NestJS 앱 컨테이너가 빌드 및 실행됩니다.
  - DB가 준비되면 자동으로 Prisma 마이그레이션(`prisma migrate deploy`)과 시드 데이터 입력(`prisma:prod-seed`)이 실행됩니다.
  - 이후 NestJS 서버가 8080 포트(로컬)로 기동됩니다.
- 프론트엔드가 호스트에서 실행 중이라면, 컨테이너 내부에서 `CLIENT_URL=http://host.docker.internal:3000`으로 접근합니다.

### 3. 기타 참고사항
- DB 데이터가 필요 없으면 `down -v`로 볼륨을 삭제해 초기화할 수 있습니다.
- seed 데이터는 빌드 결과물에 포함된 TypeScript 변수로 관리되어, 파일 복사 문제 없이 항상 동작합니다.
- 환경변수 등은 docker-compose-test.yml에서 직접 수정할 수 있습니다.
