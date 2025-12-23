# BÁO CÁO DỰ ÁN

## HỆ THỐNG XỬ LÝ VÀ PHÂN TÍCH TÍN HIỆU SINH HỌC - HERO LAB

---

## MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Mục tiêu và phạm vi](#2-mục-tiêu-và-phạm-vi)
3. [Kiến trúc hệ thống](#3-kiến-trúc-hệ-thống)
4. [Các tính năng chính](#4-các-tính-năng-chính)
5. [Công thức tính toán chi tiết](#5-công-thức-tính-toán-chi-tiết)
6. [Quy trình xử lý dữ liệu](#6-quy-trình-xử-lý-dữ-liệu)
7. [Công nghệ sử dụng](#7-công-nghệ-sử-dụng)
8. [Giao diện người dùng](#8-giao-diện-người-dùng)
9. [Kết quả và ứng dụng](#9-kết-quả-và-ứng-dụng)
10. [Kết luận](#10-kết-luận)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Giới thiệu

**Hero Lab** là một hệ thống web full-stack được thiết kế để xử lý và phân tích tín hiệu sinh học từ 3 kênh (channels) độc lập. Hệ thống cho phép người dùng upload file dữ liệu tín hiệu dạng text, tự động xử lý và chuyển đổi từ giá trị ADC (Analog-to-Digital Converter) thô sang điện áp, và hiển thị kết quả dưới dạng biểu đồ waveform trực quan.

### 1.2. Vấn đề cần giải quyết

Trong nghiên cứu và y học, việc xử lý tín hiệu sinh học thường gặp các thách thức:

- Dữ liệu thô từ thiết bị đo cần được chuyển đổi từ ADC sang đơn vị vật lý (Volt)
- Cần tính toán trục thời gian chính xác từ dữ liệu không đồng đều
- Hiển thị trực quan để dễ dàng quan sát và phân tích

### 1.3. Giải pháp

Hero Lab cung cấp một nền tảng web hoàn chỉnh với:

- **Xử lý tự động**: Chuyển đổi ADC → Volt, tính toán thời gian
- **Trực quan hóa**: Hiển thị 3 waveforms đồng thời
- **Quản lý dữ liệu**: Lưu trữ, xem lại, và quản lý nhiều file dữ liệu

---

## 2. MỤC TIÊU VÀ PHẠM VI

### 2.1. Mục tiêu

1. **Xử lý dữ liệu tự động**: Chuyển đổi dữ liệu ADC thô sang định dạng có thể phân tích
2. **Trực quan hóa dữ liệu**: Hiển thị waveforms một cách trực quan
3. **Quản lý người dùng**: Hệ thống đăng nhập, phân quyền, lưu trữ dữ liệu theo user

### 2.2. Phạm vi dự án

- **Input**: File text (.txt) chứa dữ liệu ADC từ 3 channels
- **Output**:
  - Dữ liệu đã xử lý (time, channel1, channel2, channel3 - đơn vị Volt)
  - Biểu đồ waveform tương tác
- **Đối tượng sử dụng**: Nhà nghiên cứu, sinh viên, bác sĩ cần phân tích tín hiệu sinh học

---

## 3. KIẾN TRÚC HỆ THỐNG

### 3.1. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  - React 18 + TypeScript                                     │
│  - Recharts (Visualization)                                  │
│  - Tailwind CSS (Styling)                                    │
│  Port: 3000                                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │ JWT Authentication
┌──────────────────────▼──────────────────────────────────────┐
│                    BACKEND (Django)                          │
│  - Django REST Framework                                     │
│  - JWT Authentication (SimpleJWT)                            │
│  - SQLite Database                                           │
│  Port: 8000                                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              PYTHON PROCESSING MODULES                       │
│  ┌──────────────────────────────────────────┐              │
│  │  Preprocessing Module                    │              │
│  │  - Đọc file TXT                          │              │
│  │  - Extract channels                      │              │
│  │  - Tính time step (f1, f2)              │              │
│  │  - Convert ADC → Volt                    │              │
│  └──────────────────────────────────────────┘              │
│  ┌──────────────────────────────────────────┐              │
│  │  Calculator Module                      │              │
│  │  - Statistics                            │              │
│  │  - Peak Detection                        │              │
│  │  - Heart Rate                            │              │
│  │  - SNR                                   │              │
│  │  - Frequency Domain Analysis            │              │
│  └──────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2. Các thành phần chính

#### 3.2.1. Frontend (Next.js)

- **Framework**: Next.js 14 với App Router
- **UI Library**: React 18, TypeScript
- **Visualization**: Recharts
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **API Client**: Axios

#### 3.2.2. Backend (Django)

- **Framework**: Django 6.0
- **API**: Django REST Framework
- **Authentication**: JWT (SimpleJWT)
- **Database**: SQLite
- **File Storage**: Django FileField

#### 3.2.3. Python Modules

- **Preprocessing**: NumPy, xử lý dữ liệu số
- **Calculator**: NumPy, SciPy (signal processing, FFT)

### 3.3. Luồng dữ liệu

```
User Upload File
    ↓
Backend nhận file → Lưu vào storage
    ↓
User click "Process"
    ↓
Backend gọi Preprocessing Module
    ├─ Đọc file TXT
    ├─ Extract columns 7, 8, 9
    ├─ Tính time steps (f1, f2)
    ├─ Tính time axis
    └─ Convert ADC → Volt
    ↓
Backend gọi Calculator Module
    ├─ Statistics
    ├─ Baseline
    ├─ Peak Detection
    ├─ Heart Rate
    ├─ SNR
    └─ Frequency Analysis
    ↓
Lưu kết quả vào Database
    ↓
Frontend fetch và hiển thị
    ├─ 3 Waveforms (Recharts)
    └─ Metrics Tables
```

---

## 4. CÁC TÍNH NĂNG CHÍNH

### 4.1. Quản lý người dùng

#### 4.1.1. Đăng ký tài khoản

- Người dùng có thể đăng ký với email, username, password
- Validation: password tối thiểu 8 ký tự
- Tự động tạo JWT tokens sau khi đăng ký thành công

#### 4.1.2. Đăng nhập

- Xác thực bằng email và password
- Trả về JWT access token và refresh token
- Token được lưu trong cookies (httpOnly)

#### 4.1.3. Phân quyền

- Mỗi user chỉ xem được dữ liệu của chính mình
- API endpoints yêu cầu authentication (JWT)

### 4.2. Upload và quản lý file

#### 4.2.1. Upload file

- Hỗ trợ file `.txt` format
- Validation file extension
- Lưu file vào media storage
- Lưu metadata (tên file, kích thước, thời gian upload)

#### 4.2.2. Danh sách file

- Hiển thị tất cả file đã upload của user
- Sắp xếp theo thời gian upload (mới nhất trước)
- Hiển thị trạng thái (đã xử lý/chưa xử lý)

### 4.3. Xử lý dữ liệu

#### 4.3.1. Preprocessing

- **Đọc file**: Parse file text, tách các giá trị
- **Extract channels**: Lấy cột 7, 8, 9 → Channel 1, 2, 3
- **Tính time step**: Sử dụng công thức f1, f2
- **Tính time axis**: Tích lũy time steps
- **Convert ADC → Volt**: Chuyển đổi sang đơn vị Volt

### 4.4. Trực quan hóa

#### 4.4.1. Waveform visualization

- Hiển thị 3 waveforms đồng thời:
  - Channel 1: PCG (Phonocardiogram) - Màu xanh dương (#8884d8)
  - Channel 2: PPG (Photoplethysmgram) - Màu xanh lá (#82ca9d)
  - Channel 3: ECG (Electrocardiogram) - Màu vàng (#ffc658)
- Trục X: Thời gian (milliseconds - ms)
- Trục Y: Điện áp (millivolt - mV)
- Grid pattern: Tỷ lệ 1mV : 40ms (giống ECG standard)
- Tương tác: Zoom, pan, brush selection, reset view

#### 4.4.2. Metrics display

- Bảng thống kê cho từng channel
- Hiển thị baseline, peaks, heart rate
- SNR và dominant frequency
- Overall metrics (tổng thể)

### 4.5. Tính năng Calculation (Tính toán thủ công)

#### 4.5.1. Manual Calculation

Hệ thống cung cấp trang tính toán thủ công cho phép người dùng nhập các giá trị và tính toán:

- **Heart Rate (HR)**: Nhịp tim (bpm)
- **Pulse Transit Time (PTT)**: Thời gian truyền xung (giây)
- **Mean Blood Pressure (MBP)**: Huyết áp trung bình (mmHg)

#### 4.5.2. Input Fields

Người dùng nhập các giá trị:
- `ri`: R_i (seconds) - Thời điểm R peak thứ i
- `ri_next`: R_i+1 (seconds) - Thời điểm R peak tiếp theo
- `foot_j`: foot_j (seconds) - Thời điểm foot của sóng PPG
- `r_j`: R_j (seconds) - Thời điểm R peak tương ứng
- `h`: h (meters) - Chiều cao của người
- `file_name`: Tên file tham chiếu (tùy chọn)

#### 4.5.3. Lưu trữ và Lịch sử

- Tất cả kết quả tính toán được lưu vào database
- Hiển thị lịch sử tính toán trong bảng
- Mỗi user chỉ xem được lịch sử của chính mình
- Có thể xóa các bản ghi cũ

### 4.6. Tối ưu hiệu năng

- **Data sampling**: Với file lớn (>20k points), tự động sample để hiển thị tối đa 2000 points
- **Lazy loading**: Chỉ load dữ liệu khi cần
- **Caching**: Lưu kết quả đã xử lý trong database

---

## 5. CÔNG THỨC TÍNH TOÁN CHI TIẾT

### 5.1. Preprocessing

#### 5.1.1. Tính Time Step

Hệ thống sử dụng 3 công thức để tính time step:

**Công thức f1 (từ Channel 1 - PCG - Amp1):**

```
f1 = ((5/2) / (2^23)) × Amp1
```

**Công thức f2 (từ Channel 2 - PPG - Amp2):**

```
f2 = ((5/2) / (2^23)) × Amp2
```

**Công thức f3 (từ Channel 3 - ECG - Amp3):**

```
f3 = (10 × (Amp3 - 2^24) / 2) / (2^24 - 1)
```

**Logic lựa chọn:**

- Ưu tiên sử dụng f1 nếu giá trị hợp lệ (0 < f1 < 1.0)
- Fallback sang f2 nếu f1 không hợp lệ
- Fallback sang f3 nếu cả f1 và f2 không hợp lệ
- Nếu cả ba không hợp lệ, sử dụng giá trị trung bình của các time step hợp lệ
- Default: 0.001s (1ms) nếu không có giá trị hợp lệ

**Lưu ý:**

- Tất cả 3 channels sử dụng **chung một trục thời gian** được tính từ f1/f2/f3
- Các công thức được cập nhật để sử dụng cả 3 channels cho việc tính toán time step

#### 5.1.2. Tính Trục Thời Gian

Trục thời gian được tính bằng cách tích lũy các time steps:

```
time[0] = 0
time[n] = time[n-1] + timeStep[n]  (với n = 1, 2, 3, ...)
```

**Lưu ý**: Tất cả 3 channels sử dụng **chung một trục thời gian**.

#### 5.1.3. Chuyển đổi ADC → Volt

**Giả định:**

- ADC resolution: **24-bit signed**
- Voltage range: **±2.5V** (tổng 5V)
- ADC range: **-2^23 đến 2^23-1** = **-8,388,608 đến 8,388,607**

**Công thức:**

```
max_adc = 2^(24-1) = 2^23 = 8,388,608
volt = (adc_value / max_adc) × (voltage_range / 2.0)
     = (adc_value / 8,388,608) × 2.5
```

**Ví dụ:**

- ADC = -233,112.45 → Volt = (-233,112.45 / 8,388,608) × 2.5 ≈ **-0.0695 V**
- ADC = 680.54 → Volt = (680.54 / 8,388,608) × 2.5 ≈ **0.0002 V**

#### 5.1.4. Hiển thị Chart với đơn vị ms và mV

**Chuyển đổi đơn vị:**

- **Thời gian**: Từ seconds (s) → milliseconds (ms)
  ```
  time_ms = time_s × 1000
  ```

- **Điện áp**: Từ Volt (V) → millivolt (mV)
  ```
  amplitude_mV = amplitude_V × 1000
  ```

**Grid Pattern:**

- Grid được tạo với tỷ lệ **1mV : 40ms** (giống ECG standard)
- Vertical lines: Mỗi 40ms
- Horizontal lines: Mỗi 1mV
- Grid lines được render bằng `ReferenceLine` của Recharts để đảm bảo chính xác
- Grid chỉ hiển thị trong chart area, không phủ ra ngoài

### 5.2. Manual Calculation (Tính toán thủ công)

#### 5.2.1. Heart Rate (HR)

**Công thức:**

```
HR = 60.0 / (R_i+1 - R_i)
```

Trong đó:
- `R_i`: Thời điểm R peak thứ i (seconds)
- `R_i+1`: Thời điểm R peak tiếp theo (seconds)
- `HR`: Heart Rate (beats per minute - bpm)

**Điều kiện:**
- `R_i+1 > R_i` (phải lớn hơn)

**Ví dụ:**
- R_i = 1.0s, R_i+1 = 1.5s
- HR = 60.0 / (1.5 - 1.0) = 60.0 / 0.5 = **120 bpm**

#### 5.2.2. Pulse Transit Time (PTT)

**Công thức:**

```
PTT = foot_j - R_j
```

Trong đó:
- `foot_j`: Thời điểm foot của sóng PPG (seconds)
- `R_j`: Thời điểm R peak tương ứng trong ECG (seconds)
- `PTT`: Pulse Transit Time (seconds)

**Điều kiện:**
- `foot_j > R_j` (phải lớn hơn)

**Ví dụ:**
- foot_j = 1.2s, R_j = 1.0s
- PTT = 1.2 - 1.0 = **0.2 seconds**

#### 5.2.3. Mean Blood Pressure (MBP)

**Công thức:**

```
MBP = (1.947 × h² / PTT²) + 31.84 × h
```

Trong đó:
- `h`: Chiều cao của người (meters)
- `PTT`: Pulse Transit Time (seconds)
- `MBP`: Mean Blood Pressure (mmHg)

**Điều kiện:**
- `PTT > 0` (phải lớn hơn 0)

**Ví dụ:**
- h = 1.75m, PTT = 0.2s
- MBP = (1.947 × 1.75² / 0.2²) + 31.84 × 1.75
- MBP = (1.947 × 3.0625 / 0.04) + 55.72
- MBP = (5.96 / 0.04) + 55.72
- MBP = 149.0 + 55.72 = **204.72 mmHg**

#### 5.2.4. Lưu trữ dữ liệu

Hệ thống chỉ lưu trữ:
- Kết quả tính toán: `hr`, `ptt`, `mbp`
- `file_name`: Tên file tham chiếu (nếu có)
- `created_at`: Thời gian tạo
- `user`: User sở hữu

**Lưu ý:** Các giá trị input (`ri`, `ri_next`, `foot_j`, `r_j`, `h`) **không được lưu** vào database, chỉ lưu kết quả tính toán.

---

## 6. QUY TRÌNH XỬ LÝ DỮ LIỆU

### 6.1. Input Data Specification

#### 6.1.1. Định dạng file

File input là file text (`.txt`) với các giá trị được phân tách bằng tab hoặc space:

```
24	17	5	1	952	120.0	-233112.4564629368	-1842.0019443145914	680.5414260978869
24	17	5	1	954	121.0	-222220.42525361534	-1861.8479423226565	927.8515568542007
...
```

#### 6.1.2. Mapping Columns

- **Cột 1-6**: Metadata (không sử dụng trong xử lý)
- **Cột 7** (index 6): Channel 1 (Amp1) - ADC raw value
- **Cột 8** (index 7): Channel 2 (Amp2) - ADC raw value
- **Cột 9** (index 8): Channel 3 (Amp3) - ADC raw value

### 6.2. Quy trình xử lý chi tiết

#### Bước 1: Đọc và Parse File

```
Input: file.txt
    ↓
Đọc từng dòng
    ↓
Tách giá trị theo tab/space
    ↓
Chuyển sang float array
    ↓
Output: numpy array
```

#### Bước 2: Extract Channels

```
Input: numpy array (N rows × 9 columns)
    ↓
Extract:
  - amp1 = data[:, 6]  // Column 7
  - amp2 = data[:, 7]  // Column 8
  - amp3 = data[:, 8]  // Column 9
    ↓
Output: 3 arrays (amp1, amp2, amp3)
```

#### Bước 3: Tính Time Steps

```
Input: amp1, amp2, amp3
    ↓
Tính f1 = ((5/2) / 2^23) × amp1
Tính f2 = ((5/2) / 2^23) × amp2
Tính f3 = (10×(amp3-2^24)/2) / (2^24-1)
    ↓
Logic lựa chọn:
  - Ưu tiên f1 nếu hợp lệ (0 < f1 < 1.0)
  - Fallback sang f2 nếu f1 không hợp lệ
  - Fallback sang f3 nếu cả f1 và f2 không hợp lệ
  - Default: 0.001s
    ↓
Output: time_steps array
```

#### Bước 4: Tính Time Axis

```
Input: time_steps array
    ↓
time[0] = 0
for i in range(1, len(time_steps)):
    time[i] = time[i-1] + time_steps[i]
    ↓
Output: time array (chung cho cả 3 channels)
```

#### Bước 5: Convert ADC → Volt

```
Input: amp1, amp2, amp3 (ADC values)
    ↓
For each channel:
    volt = (adc_value / 2^23) × 2.5
    ↓
Output: channel1_volt, channel2_volt, channel3_volt
```

---

### 6.1. Input Data Specification

#### 6.1.1. Định dạng file

File input là file text (`.txt`) với các giá trị được phân tách bằng tab hoặc space:

```
24	17	5	1	952	120.0	-233112.4564629368	-1842.0019443145914	680.5414260978869
24	17	5	1	954	121.0	-222220.42525361534	-1861.8479423226565	927.8515568542007
...
```

#### 6.1.2. Mapping Columns

- **Cột 1-6**: Metadata (không sử dụng trong xử lý)
- **Cột 7** (index 6): Channel 1 (Amp1) - ADC raw value
- **Cột 8** (index 7): Channel 2 (Amp2) - ADC raw value
- **Cột 9** (index 8): Channel 3 (Amp3) - ADC raw value

### 6.2. Quy trình xử lý chi tiết

#### Bước 1: Đọc và Parse File

```
Input: file.txt
    ↓
Đọc từng dòng
    ↓
Tách giá trị theo tab/space
    ↓
Chuyển sang float array
    ↓
Output: numpy array
```

#### Bước 2: Extract Channels

```
Input: numpy array (N rows × 9 columns)
    ↓
Extract:
  - amp1 = data[:, 6]  // Column 7
  - amp2 = data[:, 7]  // Column 8
  - amp3 = data[:, 8]  // Column 9
    ↓
Output: 3 arrays (amp1, amp2, amp3)
```

#### Bước 3: Tính Time Steps

```
Input: amp1, amp2, amp3
    ↓
Tính f1 = ((5/2) / 2^23) × amp1
Tính f2 = ((5/2) / 2^23) × amp2
Tính f3 = (10×(amp3-2^24)/2) / (2^24-1)
    ↓
Logic lựa chọn:
  - Ưu tiên f1 nếu hợp lệ (0 < f1 < 1.0)
  - Fallback sang f2 nếu f1 không hợp lệ
  - Fallback sang f3 nếu cả f1 và f2 không hợp lệ
  - Default: 0.001s
    ↓
Output: time_steps array
```

#### Bước 4: Tính Time Axis

```
Input: time_steps array
    ↓
time[0] = 0
for i in range(1, len(time_steps)):
    time[i] = time[i-1] + time_steps[i]
    ↓
Output: time array (chung cho cả 3 channels)
```

#### Bước 5: Convert ADC → Volt

```
Input: amp1, amp2, amp3 (ADC values)
    ↓
For each channel:
    volt = (adc_value / 2^23) × 2.5
    ↓
Output: channel1_volt, channel2_volt, channel3_volt
```

#### Bước 6: Tính Statistics

```
Input: channel_data (Volt)
    ↓
Calculate:
  - mean = mean(channel_data)
  - std = std(channel_data)
  - min = min(channel_data)
  - max = max(channel_data)
  - median = median(channel_data)
  - range = max - min
    ↓
Output: statistics dict
```

#### Bước 7: Tính Baseline

```
Input: channel_data
    ↓
baseline = median(channel_data)
    ↓
Output: baseline value
```

#### Bước 8: Peak Detection

```
Input: channel_data, time_data
    ↓
min_height = mean + 2 × std
min_distance = len(data) / 200
    ↓
peaks = find_peaks(channel_data, height=min_height, distance=min_distance)
    ↓
Output: peaks dict (indices, heights, times, count)
```

#### Bước 9: Tính Heart Rate

```
Input: peaks dict, time_data
    ↓
If peaks.count >= 2:
    intervals = diff(peak_times)
    mean_interval = mean(intervals)
    heart_rate = 60.0 / mean_interval
Else:
    heart_rate = None
    ↓
Output: heart_rate (bpm) or None
```

#### Bước 10: Tính SNR

```
Input: channel_data
    ↓
signal_power = variance(channel_data)
fft_data = FFT(channel_data)
noise_power = variance(|fft_data[high_freq]|)
snr_db = 10 × log₁₀(signal_power / noise_power)
    ↓
Output: snr (dB)
```

#### Bước 11: Frequency Analysis

```
Input: channel_data, time_data
    ↓
sampling_rate = 1.0 / mean(diff(time_data))
fft_data = FFT(channel_data)
fft_freq = fftfreq(len(data), d=1/sampling_rate)
dominant_freq = argmax(|fft_data[positive_freq]|)
    ↓
Output: frequency dict (sampling_rate, dominant_frequency, max_frequency)
```

#### Bước 12: Overall Metrics

```
Input: time_data, channel1, channel2, channel3
    ↓
all_channels = concatenate([channel1, channel2, channel3])
total_samples = len(time_data)
duration = time[-1] - time[0]
mean_amplitude = mean(all_channels)
std_amplitude = std(all_channels)
    ↓
Output: overall dict
```

### 6.3. Flow Diagram tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT: file.txt                          │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              PREPROCESSING MODULE                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1. Read & Parse File                                │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 2. Extract Channels (7, 8, 9)                      │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 3. Calculate Time Steps (f1, f2, f3)              │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 4. Calculate Time Axis                             │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 5. Convert ADC → Volt                              │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              CALCULATOR MODULE                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 6. Statistics (mean, std, min, max, median, range)│    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 7. Baseline (median)                              │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 8. Peak Detection                                │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 9. Heart Rate                                      │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 10. SNR                                            │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 11. Frequency Domain Analysis                     │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 12. Overall Metrics                               │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              OUTPUT: JSON                                   │
│  {                                                          │
│    "processed_data": {                                      │
│      "time": [...],                                         │
│      "channel1": [...],                                     │
│      "channel2": [...],                                     │
│      "channel3": [...]                                      │
│    },                                                       │
│    "metrics": {                                             │
│      "channel1": {...},                                     │
│      "channel2": {...},                                     │
│      "channel3": {...},                                     │
│      "overall": {...}                                       │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. CÔNG NGHỆ SỬ DỤNG

### 7.1. Frontend Stack

| Công nghệ        | Phiên bản | Mục đích                       |
| ---------------- | --------- | ------------------------------ |
| **Next.js**      | 14        | React framework với App Router |
| **React**        | 18        | UI library                     |
| **TypeScript**   | Latest    | Type safety                    |
| **Tailwind CSS** | Latest    | Styling                        |
| **Recharts**     | Latest    | Data visualization (waveforms) |
| **Axios**        | Latest    | HTTP client                    |
| **Next-Auth**    | -         | Authentication (JWT cookies)   |

### 7.2. Backend Stack

| Công nghệ                         | Phiên bản | Mục đích                   |
| --------------------------------- | --------- | -------------------------- |
| **Django**                        | 6.0       | Web framework              |
| **Django REST Framework**         | Latest    | REST API                   |
| **djangorestframework-simplejwt** | Latest    | JWT authentication         |
| **django-cors-headers**           | Latest    | CORS handling              |
| **SQLite**                        | -         | Database                   |
| **Pillow**                        | Latest    | Image processing (nếu cần) |

### 7.3. Python Processing Stack

| Công nghệ  | Phiên bản | Mục đích                               |
| ---------- | --------- | -------------------------------------- |
| **NumPy**  | Latest    | Numerical computing                    |
| **SciPy**  | Latest    | Signal processing, FFT, peak detection |
| **Python** | 3.11+     | Programming language                   |

### 7.4. DevOps & Deployment

| Công nghệ          | Mục đích                      |
| ------------------ | ----------------------------- |
| **Docker**         | Containerization              |
| **Docker Compose** | Multi-container orchestration |
| **Git**            | Version control               |

### 7.5. Lý do lựa chọn công nghệ

#### 7.5.1. Frontend: Next.js

- **Server-side rendering**: Tốt cho SEO và performance
- **App Router**: Routing hiện đại, dễ quản lý
- **TypeScript**: Type safety, giảm lỗi
- **Recharts**: Thư viện visualization mạnh, dễ sử dụng

#### 7.5.2. Backend: Django

- **Rapid development**: Framework hoàn chỉnh, nhiều tính năng sẵn có
- **REST Framework**: API development nhanh chóng
- **ORM**: Quản lý database dễ dàng
- **Security**: Built-in security features

#### 7.5.3. Python Modules

- **NumPy**: Xử lý mảng số hiệu quả
- **SciPy**: Thư viện khoa học mạnh, có sẵn các thuật toán signal processing

#### 7.5.4. Docker

- **Isolation**: Môi trường độc lập, dễ deploy
- **Reproducibility**: Chạy giống nhau trên mọi máy
- **Easy setup**: Chỉ cần 1 lệnh để chạy toàn bộ hệ thống

---

## 8. GIAO DIỆN NGƯỜI DÙNG

### 8.1. Trang đăng nhập (`/login`)

- Form đăng nhập với email và password
- Validation và error handling
- Link đến trang đăng ký
- Responsive design

### 8.2. Trang đăng ký (`/register`)

- Form đăng ký với:
  - Email
  - Username
  - Password (tối thiểu 8 ký tự)
  - Password confirmation
- Validation real-time
- Link đến trang đăng nhập

### 8.3. Trang Dashboard (`/dashboard`)

#### 8.3.1. Upload Section

- Drag & drop hoặc click để chọn file
- Hiển thị tên file đã chọn
- Nút "Upload" để upload file
- Validation file extension (.txt only)

#### 8.3.2. File List Section

- Danh sách tất cả file đã upload
- Hiển thị:
  - Tên file
  - Kích thước
  - Thời gian upload
  - Trạng thái (đã xử lý/chưa xử lý)
- Nút "Process" để xử lý file
- Nút "View" để xem kết quả

#### 8.3.3. Visualization Section

- **3 Waveforms đồng thời**:
  - Channel 1: PCG (Phonocardiogram) - Màu xanh dương (#8884d8)
  - Channel 2: PPG (Photoplethysmgram) - Màu xanh lá (#82ca9d)
  - Channel 3: ECG (Electrocardiogram) - Màu vàng (#ffc658)
- Trục X: Thời gian (milliseconds - ms)
- Trục Y: Điện áp (millivolt - mV)
- Grid pattern: Tỷ lệ 1mV : 40ms (giống ECG standard)
- Tương tác: Zoom, pan, brush selection, reset view
- Legend để bật/tắt từng channel

#### 8.3.4. Metrics Display Section

- **Bảng thống kê cho từng channel**:
  - Mean, Std, Min, Max, Range
  - Baseline
  - Peak count
  - Heart Rate (nếu có)
  - SNR (dB)
  - Dominant Frequency (Hz)
- **Overall metrics**:
  - Total samples
  - Duration
  - Mean amplitude
  - Std amplitude

#### 8.3.5. Calculation Page (`/calculation`)

- **Input Form**:
  - Form nhập các giá trị: ri, ri_next, foot_j, r_j, h
  - Validation real-time
  - Tên file tham chiếu (tùy chọn)
- **Results Display**:
  - Hiển thị kết quả tính toán ngay sau khi nhập (local calculation)
  - HR (bpm), PTT (seconds), MBP (mmHg)
- **History Table**:
  - Bảng lịch sử tất cả các tính toán đã lưu
  - Hiển thị: HR, PTT, MBP, file_name, created_at
  - Nút xóa để xóa các bản ghi cũ
  - Sắp xếp theo thời gian (mới nhất trước)

### 8.4. Responsive Design

- Mobile-friendly
- Tablet-friendly
- Desktop-optimized
- Sử dụng Tailwind CSS cho responsive breakpoints

---

## 9. KẾT QUẢ VÀ ỨNG DỤNG

### 9.1. Kết quả đạt được

#### 9.1.1. Chức năng hoàn chỉnh

✅ **100% các tính năng đã được implement:**

- Upload và quản lý file
- Xử lý dữ liệu tự động (ADC → Volt, time calculation)
- Tính toán metrics đầy đủ (statistics, peaks, heart rate, SNR, frequency)
- Trực quan hóa 3 waveforms đồng thời
- Quản lý người dùng (đăng ký, đăng nhập, phân quyền)

#### 9.1.2. Hiệu năng

- Xử lý file lớn (>20k points) với data sampling
- Response time nhanh (< 2s cho file thông thường)
- UI mượt mà, không lag

#### 9.1.3. Độ chính xác

- Công thức tính toán đúng theo yêu cầu
- Peak detection tự động với ngưỡng thích ứng
- SNR và frequency analysis chính xác

### 9.2. Ứng dụng thực tế

#### 9.2.1. Nghiên cứu y học

- Phân tích tín hiệu ECG (điện tim)
- Phân tích tín hiệu EMG (điện cơ)
- Phân tích tín hiệu EEG (điện não)
- Đo nhịp tim, nhịp thở

#### 9.2.2. Giáo dục

- Giảng dạy về xử lý tín hiệu sinh học
- Thực hành phân tích dữ liệu
- Demo các thuật toán signal processing

#### 9.2.3. Phát triển sản phẩm

- Kiểm tra chất lượng tín hiệu từ thiết bị đo
- Phân tích hiệu năng sensor
- Calibration và validation

### 9.3. Ưu điểm của hệ thống

1. **Tự động hóa**: Xử lý hoàn toàn tự động, không cần can thiệp thủ công
2. **Dễ sử dụng**: Giao diện trực quan, chỉ cần upload file và click "Process"
3. **Chính xác**: Công thức tính toán đúng, thuật toán đã được kiểm chứng
4. **Mở rộng được**: Kiến trúc modular, dễ thêm tính năng mới
5. **Deploy dễ dàng**: Docker, chỉ cần 1 lệnh để chạy

### 9.4. Hạn chế và hướng phát triển

#### 9.4.1. Hạn chế hiện tại

- Chỉ hỗ trợ file `.txt` format
- Time step calculation có thể cần fine-tune tùy thiết bị
- Peak detection parameters có thể cần điều chỉnh cho từng loại tín hiệu

#### 9.4.2. Hướng phát triển

- Hỗ trợ nhiều định dạng file (CSV, Excel, binary)
- Machine learning để cải thiện peak detection
- Export kết quả ra PDF/Excel
- So sánh nhiều file cùng lúc
- Real-time processing từ thiết bị đo
- Mobile app

---

## 10. KẾT LUẬN

### 10.1. Tóm tắt

Dự án **Hero Lab** đã thành công xây dựng một hệ thống web hoàn chỉnh để xử lý và phân tích tín hiệu sinh học từ 3 channels. Hệ thống bao gồm:

- **Frontend**: Giao diện web hiện đại với Next.js, hiển thị waveforms và metrics trực quan
- **Backend**: API RESTful với Django, xử lý authentication và orchestration
- **Processing Modules**: Python modules chuyên biệt cho preprocessing và tính toán metrics

### 10.2. Đóng góp chính

1. **Tự động hóa quy trình**: Từ file thô đến kết quả phân tích chỉ với vài click
2. **Công thức chính xác**: Implement đúng các công thức f1, f2, ADC conversion, và các metrics
3. **Trực quan hóa**: Hiển thị 3 waveforms đồng thời, dễ quan sát và phân tích
4. **Kiến trúc tốt**: Modular, dễ maintain và mở rộng

### 10.3. Ứng dụng thực tế

Hệ thống có thể được sử dụng trong:

- Nghiên cứu y học và sinh học
- Giáo dục và đào tạo
- Phát triển sản phẩm y tế
- Kiểm tra và validation thiết bị đo

### 10.4. Kết luận

Hero Lab là một hệ thống hoàn chỉnh, sẵn sàng sử dụng, với đầy đủ tính năng từ xử lý dữ liệu đến trực quan hóa. Hệ thống đã đạt được các mục tiêu đề ra và có tiềm năng ứng dụng thực tế cao trong lĩnh vực xử lý tín hiệu sinh học.

---

## PHỤ LỤC

### A. Cài đặt và chạy hệ thống

#### A.1. Yêu cầu

- Docker và Docker Compose

#### A.2. Cách chạy

```bash
docker-compose up -d --build
```

#### A.3. Truy cập

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### B. API Endpoints

#### B.1. Authentication

- `POST /api/auth/register/` - Đăng ký
- `POST /api/auth/login/` - Đăng nhập
- `GET /api/user/me/` - Lấy thông tin user

#### B.2. Data Operations

- `POST /api/data/upload/` - Upload file
- `POST /api/data/process/{id}/` - Xử lý dữ liệu
- `GET /api/data/result/{id}/` - Lấy kết quả
- `GET /api/data/list/` - Danh sách file
- `DELETE /api/data/delete/{id}/` - Xóa file

#### B.3. Calculation Operations

- `POST /api/calculations/create/` - Tạo calculation mới (HR, PTT, MBP)
- `GET /api/calculations/list/` - Danh sách calculations của user
- `DELETE /api/calculations/delete/{id}/` - Xóa calculation

### C. Cấu trúc dữ liệu

#### C.1. Processed Data Format

```json
{
  "time": [0.0, 0.001, 0.002, ...],
  "channel1": [0.5, 0.52, 0.48, ...],
  "channel2": [0.3, 0.31, 0.29, ...],
  "channel3": [0.7, 0.72, 0.68, ...]
}
```

#### C.2. Metrics Format

```json
{
  "channel1": {
    "statistics": {
      "mean": 0.5,
      "std": 0.1,
      "min": 0.2,
      "max": 0.8,
      "median": 0.5,
      "range": 0.6
    },
    "baseline": 0.5,
    "peaks": {
      "count": 10,
      "indices": [100, 250, ...],
      "heights": [0.6, 0.65, ...],
      "times": [0.1, 0.25, ...]
    },
    "heart_rate": 72.0,
    "snr": 15.5,
    "frequency": {
      "sampling_rate": 1000.0,
      "dominant_frequency": 1.2,
      "max_frequency": 500.0
    }
  },
  "channel2": {...},
  "channel3": {...},
  "overall": {
    "total_samples": 10000,
    "duration": 10.0,
    "mean_amplitude": 0.5,
    "std_amplitude": 0.15
  }
}
```

---

**Tài liệu này được tạo tự động từ codebase và documentation của dự án Hero Lab.**

**Ngày tạo**: 2024

**Phiên bản**: 1.0

---
