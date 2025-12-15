# JuuxHair2 서버 배포 가이드

이 문서는 JuuxHair2 애플리케이션(Frontend + Backend)을 서버 환경에 배포하기 위한 절차를 설명합니다. 이 프로젝트는 **Docker**와 **Docker Compose**를 사용하여 컨테이너화되어 있습니다.

## 1. 사전 요구 사항 (Prerequisites)

서버에 다음 소프트웨어가 설치되어 있어야 합니다:

*   **Docker Engine**: [설치 가이드](https://docs.docker.com/engine/install/)
*   **Docker Compose**: (최신 Docker Desktop 또는 Plugin 버전 권장)
*   **Git**: 소스 코드를 가져오기 위함

## 2. 프로젝트 설정 (Configuration)

### 2.1 리포지토리 클론
```bash
git clone <repository-url>
cd juuxhair2
```

### 2.2 환경 변수 설정
백엔드 서버를 위한 환경 변수 파일(`.env`)을 설정해야 합니다.

1.  `hairfit_server` 디렉토리로 이동하여 `.env` 파일을 생성합니다.
    ```bash
    cd hairfit_server
    cp .env.example .env
    ```
2.  `.env` 파일을 편집하여 실제 운영 환경에 맞는 값을 입력합니다.
    *   `SECRET_KEY`: 강력한 무작위 문자열로 변경
    *   `ALGORITHM`: (기본값 유지 가능, 예: HS256)
    *   `ACCESS_TOKEN_EXPIRE_MINUTES`: 토큰 만료 시간
    *   `GEMINI_API_KEY`: Google Gemini API 키
    *   `SQLALCHEMY_DATABASE_URL`: 데이터베이스 경로 (기본 SQLite 사용 시 유지)

## 3. 서비스 실행 (Execution)

프로젝트 루트 디렉토리(`juuxhair2`)에서 다음 명령어를 실행하여 서비스를 빌드하고 시작합니다.

```bash
# 루트 디렉토리로 이동 (이미 루트라면 생략)
cd ..

# Docker Compose로 서비스 빌드 및 백그라운드 실행
docker compose up -d --build
```

이 명령어는 다음 작업을 수행합니다:
1.  **Backend 이미지 빌드**: Python FastAPI 환경 구성
2.  **Frontend 이미지 빌드**: React/Vite 앱 빌드 및 Nginx 설정 포함
3.  **컨테이너 실행**: `backend` (8000포트) 및 `frontend` (8083포트 -> 내부 80포트) 실행

## 4. 배포 확인

서비스가 정상적으로 실행되었는지 확인합니다.

```bash
docker compose ps
```
상태가 `Up` 또는 `Running`이어야 합니다.

*   **웹 접속**: `http://<서버-IP-또는-도메인>:8083` (포트는 docker-compose.yml 설정에 따름)
*   **API 확인**: `http://<서버-IP-또는-도메인>:8083/api/docs` (Swagger UI, Nginx 프록시 경유)

## 5. 주요 관리 명령

### 로그 확인
전체 서비스 로그를 실시간으로 확인합니다.
```bash
docker compose logs -f
```

특정 서비스(예: backend) 로그만 확인:
```bash
docker compose logs -f backend
```

### 서비스 중지
```bash
docker compose down
```

### 최신 변경 사항 반영 (재배포)
코드가 업데이트되었거나 환경 설정을 변경한 경우:
```bash
git pull
docker compose up -d --build
```

### 보안 패치 적용 (Nginx 등)
Nginx 설정(`nginx/nginx.conf`)만 변경한 경우 프론트엔드만 다시 빌드하여 빠르게 적용할 수 있습니다.
```bash
docker compose up -d --build frontend
```

## 6. 보안 설정 참고

*   **숨김 파일 차단**: Nginx 설정에 `.env`, `.git` 등 민감한 파일에 대한 접근 차단 설정이 포함되어 있습니다.
*   **포트 보안**: `docker-compose.yml`에서 `frontend`는 8083 포트로 호스트에 노출되어 있습니다. 실제 운영 시에는 방화벽 설정이나 앞단에 Reverse Proxy (AWS ALB, 또 다른 Nginx 등)를 두어 80/443 포트로 서비스하는 것을 권장합니다.

## 7. 데이터베이스

기본적으로 `sqlite:///./db/hairfit.db`를 사용하며, 컨테이너 내 `/app/db` 볼륨에 저장됩니다.
Docker 볼륨(`db_data`)을 사용하므로 컨테이너를 재시작해도 데이터는 유지됩니다.

---
**문의**: 배포 중 문제가 발생하면 `docker compose logs` 내용을 확인해 주세요.
