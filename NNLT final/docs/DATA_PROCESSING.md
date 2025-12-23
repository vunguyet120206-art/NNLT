# Data Processing Documentation

## Tổng quan

Tài liệu này mô tả chi tiết quy trình xử lý dữ liệu tín hiệu sinh học trong hệ thống Hero Lab.

---

## 1. Input Data Format

### Cấu trúc file .txt

File input là file text với các giá trị được phân tách bằng tab hoặc space:

```
24	17	5	1	952	120.0	-233112.4564629368	-1842.0019443145914	680.5414260978869
24	17	5	1	954	121.0	-222220.42525361534	-1861.8479423226565	927.8515568542007
...
```

### Mapping Columns

- **Cột 1-6**: Metadata (không sử dụng)
- **Cột 7** (index 6): Channel 1 (Amp1) - ADC raw value
- **Cột 8** (index 7): Channel 2 (Amp2) - ADC raw value
- **Cột 9** (index 8): Channel 3 (Amp3) - ADC raw value

---

## 2. Preprocessing Module

### 2.1 Đọc File

```python
def read_txt_file(file_path):
    # Đọc từng dòng, tách giá trị, chuyển sang float
    # Trả về numpy array
```

### 2.2 Extract Channels

```python
amp1 = data[:, 6]  # Column 7
amp2 = data[:, 7]  # Column 8
amp3 = data[:, 8]  # Column 9
```

### 2.3 Tính Time Step

Công thức từ yêu cầu:

```python
# f1 từ Amp1
f1 = ((5/2) / (2^23)) * Amp1

# f2 từ Amp2
f2 = (10*(Amp2 - 2^24) / 2) / (2^24 - 1)
```

**Logic sử dụng:**
- Ưu tiên sử dụng f1 nếu giá trị hợp lệ (> 0 và < 1.0)
- Fallback sang f2 nếu f1 không hợp lệ
- Nếu cả hai không hợp lệ, sử dụng giá trị trung bình của các time step hợp lệ
- Default: 0.001s (1ms) nếu không có giá trị hợp lệ nào

### 2.4 Tính Trục Thời Gian

```python
time[0] = 0
for i in range(1, len(time_steps)):
    time[i] = time[i-1] + time_steps[i]
```

**Lưu ý:** Tất cả 3 channel sử dụng **chung một trục thời gian**.

### 2.5 Convert ADC → Volt

**Giả định:**
- ADC resolution: 24-bit signed
- Voltage range: ±2.5V (tổng 5V)
- ADC range: -2^23 đến 2^23-1

**Công thức:**
```python
max_adc = 2^(24-1) = 2^23 = 8,388,608
volt = (adc_value / max_adc) * (voltage_range / 2.0)
     = (adc_value / 8388608) * 2.5
```

**Ví dụ:**
- ADC = -233112.45 → Volt = (-233112.45 / 8388608) * 2.5 ≈ -0.0695 V
- ADC = 680.54 → Volt = (680.54 / 8388608) * 2.5 ≈ 0.0002 V

### 2.6 Output Format

```json
{
  "time": [0.0, 0.001, 0.002, ...],
  "channel1": [volt1, volt2, volt3, ...],
  "channel2": [volt1, volt2, volt3, ...],
  "channel3": [volt1, volt2, volt3, ...]
}
```

---

## 3. Calculator Module

### 3.1 Statistics

Tính các thống kê cơ bản cho mỗi channel:
- Mean (trung bình)
- Std (độ lệch chuẩn)
- Min/Max
- Median
- Range (Max - Min)

### 3.2 Baseline

Tính baseline bằng phương pháp:
- **Median**: Giá trị trung vị (mặc định)
- **Mean**: Trung bình
- **Mode**: Giá trị xuất hiện nhiều nhất

### 3.3 Peak Detection

Sử dụng `scipy.signal.find_peaks`:

**Parameters:**
- `height`: Độ cao tối thiểu
  - Tự động: `mean + 2 * std`
- `distance`: Khoảng cách tối thiểu giữa các peaks
  - Tự động: `len(data) / 200` (giả sử ~0.5s giữa các peaks)

**Output:**
```json
{
  "indices": [100, 250, 400, ...],
  "heights": [0.5, 0.52, 0.48, ...],
  "times": [0.1, 0.25, 0.4, ...],
  "count": 3
}
```

### 3.4 Heart Rate

Tính từ khoảng thời gian giữa các peaks:

```python
intervals = diff(peak_times)  # Khoảng thời gian (giây)
mean_interval = mean(intervals)
heart_rate = 60.0 / mean_interval  # bpm
```

**Yêu cầu:** Ít nhất 2 peaks để tính được heart rate.

### 3.5 SNR (Signal-to-Noise Ratio)

**Cách tính:**
1. Signal power = variance của tín hiệu
2. Noise power = variance của high-frequency components (FFT)
3. SNR (linear) = signal_power / noise_power
4. SNR (dB) = 10 * log10(SNR_linear)

**High frequency:** > 0.3 normalized frequency

### 3.6 Frequency Domain Analysis

**FFT Analysis:**
- Tính sampling rate từ time data
- FFT của tín hiệu
- Tìm dominant frequency (tần số có amplitude lớn nhất)

**Output:**
```json
{
  "sampling_rate": 1000.0,
  "dominant_frequency": 1.5,
  "max_frequency": 500.0
}
```

---

## 4. Visualization

### 4.1 Waveform Display

Frontend sử dụng **Recharts** để vẽ 3 waveforms:
- **Channel 1**: Màu xanh dương (#8884d8)
- **Channel 2**: Màu xanh lá (#82ca9d)
- **Channel 3**: Màu vàng (#ffc658)

### 4.2 Data Sampling

Để tránh lag với file lớn (>20k points), frontend samples data:
- Hiển thị tối đa 2000 points
- Sample rate = `floor(total_points / 2000)`

### 4.3 Metrics Display

Hiển thị metrics cho từng channel:
- Statistics table
- Baseline value
- Peak count
- Heart rate (nếu có)
- SNR
- Dominant frequency

---

## 5. Flow Diagram

```
Input File (.txt)
    ↓
Read & Parse
    ↓
Extract Columns 7,8,9 → Amp1, Amp2, Amp3
    ↓
Calculate Time Steps (f1, f2)
    ↓
Calculate Time Axis (t[n] = t[n-1] + dt)
    ↓
Convert ADC → Volt
    ↓
Output: {time, channel1, channel2, channel3}
    ↓
Calculate Metrics
    ├─ Statistics
    ├─ Baseline
    ├─ Peaks
    ├─ Heart Rate
    ├─ SNR
    └─ Frequency Domain
    ↓
Output: Metrics JSON
    ↓
Frontend Visualization
```

---

## 6. Ví dụ

### Input (một dòng):
```
24	17	5	1	952	120.0	-233112.4564629368	-1842.0019443145914	680.5414260978869
```

### Processing:
1. Extract:
   - Amp1 = -233112.4564629368
   - Amp2 = -1842.0019443145914
   - Amp3 = 680.5414260978869

2. Calculate f1:
   - f1 = ((5/2) / 8388608) * (-233112.4564629368) ≈ -0.0000695

3. Calculate f2:
   - f2 = (10 * (-1842.0019443145914 - 16777216) / 2) / (16777216 - 1) ≈ -5.0

4. Time step: Sử dụng f1 (vì f2 quá lớn, không hợp lệ)

5. Convert to Volt:
   - Channel1: (-233112.4564629368 / 8388608) * 2.5 ≈ -0.0695 V
   - Channel2: (-1842.0019443145914 / 8388608) * 2.5 ≈ -0.0005 V
   - Channel3: (680.5414260978869 / 8388608) * 2.5 ≈ 0.0002 V

---

## 7. Lưu ý và Giới hạn

1. **Time Step Calculation**: Logic hiện tại ưu tiên f1. Có thể cần điều chỉnh tùy theo thiết bị thực tế.

2. **ADC Resolution**: Giả định 24-bit signed. Nếu thiết bị khác, cần điều chỉnh trong `convert_adc_to_volt()`.

3. **Peak Detection**: Parameters có thể cần fine-tune tùy theo loại tín hiệu.

4. **Performance**: Với file >100k points, có thể cần optimize preprocessing.

5. **Error Handling**: Module xử lý các trường hợp:
   - File rỗng
   - Dòng không hợp lệ
   - Time step không hợp lệ
   - Không đủ peaks để tính heart rate

---

## 8. Testing

### Test Preprocessing:
```bash
cd python
python -m preprocessing.processor ../fake_signal_data.txt
```

### Test Calculator:
```bash
# Cần file processed_data.json trước
python -m calculator.metrics processed_data.json
```

---

**End of Documentation**

