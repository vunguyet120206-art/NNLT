# Hero Lab - Biological Signal Processing System

Hệ thống web xử lý và phân tích tín hiệu sinh học từ 3 channel, với khả năng upload file dữ liệu, xử lý tín hiệu, tính toán các chỉ số sinh học và hiển thị kết quả.

## ⚡ Quick Start (Cho người mới clone)

**Chỉ cần 1 lệnh:**

```bash
docker-compose up -d --build
```

Sau đó truy cập: http://localhost:3000

Xem hướng dẫn chi tiết tại [SETUP.md](./SETUP.md)

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt và chạy](#cài-đặt-và-chạy)
- [API Documentation](#api-documentation)
- [Quy trình xử lý dữ liệu](#quy-trình-xử-lý-dữ-liệu)
- [Docker](#docker)

---

## 🎯 Tổng quan

Hero Lab là một hệ thống full-stack để:
- **Upload** file dữ liệu tín hiệu sinh học (.txt)
- **Xử lý** dữ liệu ADC raw values từ 3 channel
- **Chuyển đổi** ADC → Volt và tính toán trục thời gian
- **Tính toán** các metrics sinh học (peaks, baseline, heart rate, SNR, etc.)
- **Visualize** waveforms và hiển thị kết quả

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────┐
│   Frontend  │  Next.js 14 (React, TypeScript, Recharts)
│  (Port 3000)│
└──────┬──────┘
       │ HTTP/REST
┌──────▼──────┐
│   Backend   │  Django REST Framework
│  (Port 8000)│  JWT Authentication
└──────┬──────┘
       │
┌──────▼──────────────────┐
│  Python Modules         │
│  ├─ Preprocessing       │  ADC → Volt, Time calculation
│  └─ Calculator          │  Metrics, Peak detection, HR
└─────────────────────────┘
```

### Components

1. **Frontend (Next.js)**
   - Authentication (Login/Register)
   - File Upload
   - Data Visualization (3 waveforms)
   - Metrics Display

2. **Backend (Django)**
   - REST API
   - JWT Authentication
   - File Management
   - Data Processing Orchestration

3. **Python Modules**
   - **Preprocessing**: Đọc TXT, extract channels, convert ADC→Volt, tính time
   - **Calculator**: Tính metrics, peak detection, baseline, heart rate

---

## 📁 Cấu trúc dự án

```
hero-lab/
├── frontend/                 # Next.js Frontend
│   ├── app/                  # Next.js App Router
│   │   ├── login/           # Login page
│   │   ├── register/        # Register page
│   │   └── dashboard/       # Main dashboard
│   ├── components/          # React components
│   │   ├── SignalUpload.tsx
│   │   └── SignalVisualization.tsx
│   └── lib/                 # Utilities
│       ├── api.ts           # API client
│       └── auth.ts          # Auth helpers
│
├── backend/                  # Django Backend
│   ├── hero_lab/            # Django project
│   │   ├── settings.py
│   │   └── urls.py
│   ├── api/                 # API app
│   │   ├── models.py        # User, SignalData
│   │   ├── views.py         # API endpoints
│   │   ├── serializers.py
│   │   └── urls.py
│   └── manage.py
│
├── python/                   # Python Processing Modules
│   ├── preprocessing/
│   │   └── processor.py    # ADC conversion, time calculation
│   └── calculator/
│       └── metrics.py       # Biological metrics
│
├── docker/                   # Dockerfiles
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
│
├── docker-compose.yml        # Docker Compose config
├── fake_signal_data.txt      # Sample input data
└── README.md
```

---

## 🚀 Cài đặt và chạy

### Yêu cầu

- **Docker & Docker Compose** (Khuyến nghị - Chỉ cần 1 lệnh!)
- Hoặc: Python 3.11+ và Node.js 18+ (cho local development)

### ⚡ Cách nhanh nhất: Docker (Khuyến nghị)

**Chỉ cần 1 lệnh để chạy toàn bộ hệ thống:**

```bash
docker-compose up --build
```

Sau đó truy cập:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

**Tài khoản mặc định:**
- Email: `admin@hero-lab.com`
- Password: `1234`

Xem chi tiết tại [QUICK_START.md](./QUICK_START.md) và [ACCOUNT_INFO.md](./ACCOUNT_INFO.md)

---

### Cách 2: Chạy Local (Development)

#### 1. Backend Setup

```bash
# Tạo virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Python modules dependencies
cd ../python
pip install -r requirements.txt
cd ../backend

# Migrations
python manage.py migrate

# Tạo superuser (optional)
python manage.py createsuperuser

# Run server
python manage.py runserver
```

Backend sẽ chạy tại: `http://localhost:8000`

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

### Cách 2: Chạy với Docker

```bash
# Build và start tất cả services
docker-compose up --build

# Hoặc chạy ở background
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services sẽ chạy tại:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

---

## 📡 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "password_confirm": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  },
  "tokens": {
    "access": "jwt_token",
    "refresh": "refresh_token"
  }
}
```

#### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Tương tự Register

### Data Operations

#### Upload File
```http
POST /api/data/upload/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: <file.txt>
```

**Response:**
```json
{
  "id": "uuid",
  "file_name": "signal_data.txt",
  "file_size": 12345,
  "uploaded_at": "2024-01-01T00:00:00Z"
}
```

#### Process Data
```http
POST /api/data/process/{data_id}/
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "uuid",
  "processed_data": {
    "time": [0.0, 0.001, 0.002, ...],
    "channel1": [0.5, 0.52, 0.48, ...],
    "channel2": [0.3, 0.31, 0.29, ...],
    "channel3": [0.7, 0.72, 0.68, ...]
  },
  "metrics": {
    "channel1": { ... },
    "channel2": { ... },
    "channel3": { ... },
    "overall": { ... }
  }
}
```

#### Get Result
```http
GET /api/data/result/{data_id}/
Authorization: Bearer {access_token}
```

#### List Data
```http
GET /api/data/list/
Authorization: Bearer {access_token}
```

#### Get Current User
```http
GET /api/user/me/
Authorization: Bearer {access_token}
```

---

## 🔬 Quy trình xử lý dữ liệu

### 1. Input Data Specification

File `.txt` chứa các cột giá trị ADC:
- **Cột 7** → Channel 1 (Amp1)
- **Cột 8** → Channel 2 (Amp2)
- **Cột 9** → Channel 3 (Amp3)

### 2. Mapping Columns → Channels

```python
# Trong preprocessing/processor.py
amp1 = data[:, 6]  # Column 7 (index 6)
amp2 = data[:, 7]  # Column 8 (index 7)
amp3 = data[:, 8]  # Column 9 (index 8)
```

### 3. Tính Time Step (f1, f2)

Công thức:
```python
f1 = ((5/2) / (2^23)) * Amp1
f2 = (10*(Amp2 - 2^24) / 2) / (2^24 - 1)
```

Time step được tính từ f1 (hoặc fallback sang f2 nếu f1 không hợp lệ).

### 4. Tính Trục Thời Gian

```python
t[n] = t[n-1] + timeStep[n]
```

Tất cả 3 channel sử dụng **chung một trục thời gian**.

### 5. Convert ADC → Volt

```python
# Giả sử 24-bit signed ADC
max_adc = 2^(24-1) = 2^23
volt = (adc_value / max_adc) * (voltage_range / 2.0)
```

Với `voltage_range = 5.0V` (mặc định).

### 6. Tính Metrics

Sau khi có dữ liệu đã convert:
- **Statistics**: mean, std, min, max, median, range
- **Baseline**: median của tín hiệu
- **Peak Detection**: sử dụng scipy.signal.find_peaks
- **Heart Rate**: tính từ khoảng thời gian giữa các peaks
- **SNR**: Signal-to-Noise Ratio (dB)
- **Frequency Domain**: FFT analysis, dominant frequency

### 7. Visualization

Frontend sử dụng **Recharts** để vẽ 3 waveforms:
- Channel 1 (màu xanh dương)
- Channel 2 (màu xanh lá)
- Channel 3 (màu vàng)

---

## 🐳 Docker

### Docker Compose Services

1. **backend**: Django API server
2. **frontend**: Next.js development server

### Environment Variables

Backend:
- `DEBUG`: True/False
- `SECRET_KEY`: Django secret key
- `CORS_ALLOWED_ORIGINS`: Allowed CORS origins

Frontend:
- `NEXT_PUBLIC_BASE_API_URL`: Backend API URL
- `NEXT_PUBLIC_BASE_URL`: Frontend base URL

### Volumes

- `backend_media`: Uploaded files
- `backend_db`: SQLite database
- Frontend code mounted for hot-reload

---

## 📊 Ví dụ Request/Response

### Upload và Process

```bash
# 1. Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# 2. Upload file (sử dụng token từ step 1)
curl -X POST http://localhost:8000/api/data/upload/ \
  -H "Authorization: Bearer {access_token}" \
  -F "file=@fake_signal_data.txt"

# 3. Process data
curl -X POST http://localhost:8000/api/data/process/{data_id}/ \
  -H "Authorization: Bearer {access_token}"

# 4. Get result
curl -X GET http://localhost:8000/api/data/result/{data_id}/ \
  -H "Authorization: Bearer {access_token}"
```

---

## 🛠️ Development

### Backend Development

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend Development

```bash
cd frontend
npm run dev
```

### Testing Python Modules

```bash
# Test preprocessing
cd python
python -m preprocessing.processor ../fake_signal_data.txt

# Test calculator (cần processed JSON)
python -m calculator.metrics processed_data.json
```

---

## 📝 Notes

1. **Time Step Calculation**: Hiện tại sử dụng f1 làm time step chính. Có thể điều chỉnh logic trong `preprocessing/processor.py` nếu cần.

2. **ADC Resolution**: Mặc định 24-bit signed. Có thể thay đổi trong `convert_adc_to_volt()`.

3. **Peak Detection**: Parameters có thể điều chỉnh trong `calculator/metrics.py` (min_height, min_distance).

4. **Performance**: Frontend samples data để hiển thị (mỗi Nth point) để tránh lag với file lớn.

---

## 🔒 Security

- JWT tokens với expiration
- Password validation (min 8 chars)
- CORS configuration
- File type validation (.txt only)
- User isolation (chỉ xem được data của mình)

---

## 📄 License

MIT

---

## 👥 Contributors

Hero Lab Development Team

---

## 🐛 Troubleshooting

### Backend không start
- Kiểm tra Python version (3.11+)
- Kiểm tra dependencies: `pip install -r requirements.txt`
- Kiểm tra migrations: `python manage.py migrate`

### Frontend không connect được backend
- Kiểm tra `NEXT_PUBLIC_BASE_API_URL` trong `.env` hoặc `next.config.js`
- Kiểm tra CORS settings trong Django settings

### Processing failed
- Kiểm tra file format (phải có ít nhất 9 cột)
- Kiểm tra Python modules path trong `backend/api/views.py`
- Xem logs trong Django console

---

**Happy Coding! 🚀**
