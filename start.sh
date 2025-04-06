#!/bin/sh

# 데이터베이스 마이그레이션 실행
echo "Running migrations..."
pnpm run prisma:migrate

# 애플리케이션 시작
echo "Starting application..."
pnpm run start:prod 