# Stage 1: Build frontend
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# 프론트엔드 의존성 설치 및 빌드
COPY src/frontend/package*.json ./
RUN npm ci

COPY src/frontend/ ./
RUN npm run build

# Stage 2: Python backend
FROM python:3.11-slim

WORKDIR /app

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 백엔드 소스 복사
COPY src/ ./src/

# 프론트엔드 빌드 결과물 복사
COPY --from=frontend-builder /app/frontend/dist ./src/frontend/dist

WORKDIR /app/src

EXPOSE 8080

# Railway sets PORT env variable
CMD python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
