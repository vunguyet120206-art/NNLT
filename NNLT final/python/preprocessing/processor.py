"""
Preprocessing Module for Signal Data
Converts ADC raw values to Volt and calculates time axis
"""
import json
import numpy as np


def read_txt_file(file_path):
    """
    Đọc file TXT và trả về dữ liệu dạng mảng
    
    Args:
        file_path: Đường dẫn đến file .txt
        
    Returns:
        numpy array với các cột dữ liệu
    """
    data = []
    with open(file_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line:
                # Tách các giá trị theo tab hoặc space
                values = line.split()
                if len(values) >= 9:
                    try:
                        # Chuyển đổi sang float
                        row = [float(v) for v in values]
                        data.append(row)
                    except ValueError:
                        continue
    
    return np.array(data)


def extract_channels(data):
    """
    Trích xuất 3 channel từ cột 7, 8, 9
    
    Args:
        data: numpy array chứa dữ liệu
        
    Returns:
        tuple (amp1, amp2, amp3) - các mảng giá trị ADC
    """
    # Cột 7 (index 6) = Channel 1 - PCG (Phonocardiogram) (Amp1)
    # Cột 8 (index 7) = Channel 2 - PPG (Photoplethysmgram) (Amp2)
    # Cột 9 (index 8) = Channel 3 - ECG (Electrocardiogram) (Amp3)
    amp1 = data[:, 6]  # Column 7
    amp2 = data[:, 7]  # Column 8
    amp3 = data[:, 8]  # Column 9
    
    return amp1, amp2, amp3


def calculate_time_step(amp1, amp2, amp3):
    """
    Tính time step từ công thức f1, f2 và f3
    
    Công thức:
    Channel 1 (PCG): f1 = ((5/2) / (2^23)) * Amp1
    Channel 2 (PPG): f2 = ((5/2) / (2^23)) * Amp2
    Channel 3 (ECG): f3 = (10*(Amp3 - 2^24) / 2) / (2^24 - 1)
    
    Args:
        amp1: Mảng giá trị Amp1
        amp2: Mảng giá trị Amp2
        amp3: Mảng giá trị Amp3
        
    Returns:
        numpy array chứa time steps
    """
    # Tính f1, f2 và f3
    f1 = ((5.0 / 2.0) / (2**23)) * amp1
    f2 = ((5.0 / 2.0) / (2**23)) * amp2
    f3 = (10.0 * (amp3 - 2**24) / 2.0) / (2**24 - 1)
    
    # Sử dụng f1 làm time step chính, fallback sang f2, sau đó f3
    # Nếu f1 có giá trị hợp lệ, dùng f1, ngược lại thử f2, cuối cùng dùng f3
    time_steps = np.where(
        (np.abs(f1) > 1e-10) & (f1 > 0) & (f1 < 1.0), 
        f1,
        np.where(
            (np.abs(f2) > 1e-10) & (f2 > 0) & (f2 < 1.0),
            f2,
            f3
        )
    )
    
    # Đảm bảo time step dương và hợp lý
    # Nếu time step âm hoặc quá lớn, sử dụng giá trị trung bình
    valid_steps = time_steps[(time_steps > 0) & (time_steps < 1.0)]
    if len(valid_steps) > 0:
        mean_step = np.mean(valid_steps)
    else:
        # Fallback: tính time step từ sampling rate giả định
        mean_step = 0.001  # 1ms default
    
    # Thay thế các giá trị không hợp lệ bằng mean_step
    time_steps = np.where((time_steps > 0) & (time_steps < 1.0), time_steps, mean_step)
    
    return time_steps


def calculate_time_axis(time_steps):
    """
    Tính trục thời gian từ time steps
    
    t[n] = t[n-1] + timeStep[n]
    
    Args:
        time_steps: Mảng time steps
        
    Returns:
        numpy array chứa thời gian tích lũy
    """
    time = np.zeros(len(time_steps))
    for i in range(1, len(time_steps)):
        time[i] = time[i-1] + time_steps[i]
    
    return time


def convert_adc_to_volt(adc_value, adc_resolution=24, voltage_range=5.0):
    """
    Chuyển đổi giá trị ADC sang Volt
    
    Args:
        adc_value: Giá trị ADC (raw)
        adc_resolution: Độ phân giải ADC (bits)
        voltage_range: Dải điện áp (V)
        
    Returns:
        Giá trị điện áp (V)
    """
    # ADC thường là signed integer
    # Giả sử ADC range từ -2^23 đến 2^23-1 cho 24-bit signed
    max_adc = 2**(adc_resolution - 1)
    volt = (adc_value / max_adc) * (voltage_range / 2.0)
    
    return volt


def process_signal_file(file_path):
    """
    Hàm chính xử lý file signal
    
    Args:
        file_path: Đường dẫn đến file .txt
        
    Returns:
        dict chứa time, channel1, channel2, channel3 (đã convert sang Volt)
    """
    # Đọc dữ liệu
    data = read_txt_file(file_path)
    
    if len(data) == 0:
        raise ValueError("File không chứa dữ liệu hợp lệ")
    
    # Trích xuất channels
    amp1, amp2, amp3 = extract_channels(data)
    
    # Tính time steps
    time_steps = calculate_time_step(amp1, amp2, amp3)
    
    # Tính trục thời gian
    time = calculate_time_axis(time_steps)
    
    # Convert ADC sang Volt
    channel1_volt = convert_adc_to_volt(amp1)
    channel2_volt = convert_adc_to_volt(amp2)
    channel3_volt = convert_adc_to_volt(amp3)
    
    # Trả về kết quả
    result = {
        "time": time.tolist(),
        "channel1": channel1_volt.tolist(),
        "channel2": channel2_volt.tolist(),
        "channel3": channel3_volt.tolist()
    }
    
    return result


def save_processed_data(data, output_path):
    """
    Lưu dữ liệu đã xử lý ra file JSON
    
    Args:
        data: dict chứa dữ liệu đã xử lý
        output_path: Đường dẫn file output
    """
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)


if __name__ == "__main__":
    # Test với file mẫu
    import sys
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        result = process_signal_file(file_path)
        print(json.dumps(result, indent=2))

