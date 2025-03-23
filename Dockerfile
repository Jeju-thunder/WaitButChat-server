# 1. Node.js 기반 이미지 사용 (Alpine 버전)
FROM node:18-alpine

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# 4. package.json 및 pnpm-lock.yaml 복사 후 패키지 설치
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile



# 5. 프로젝트 전체 복사
COPY . .

# Prisma Client를 컨테이너 내부에서 다시 생성
RUN pnpm prisma generate

# 6. NestJS 빌드
RUN pnpm run build

# 7. 컨테이너 실행 시 실행할 명령어
CMD ["pnpm", "run", "start:prod"]

# 8. 포트 개방
EXPOSE 8080
