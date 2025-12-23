"""
Calculator Module for Biological Signal Metrics
Tính toán các chỉ số sinh học từ tín hiệu đã preprocess
"""
import numpy as np
from scipy import signal
from scipy.signal import find_peaks


def detect_peaks(channel_data, time_data, min_height=None, min_distance=None):
    """
    Phát hiện peaks trong tín hiệu
    
    Args:
        channel_data: Mảng dữ liệu channel
        time_data: Mảng thời gian
        min_height: Độ cao tối thiểu của peak (None = tự động)
        min_distance: Khoảng cách tối thiểu giữa các peak (số samples)
        
    Returns:
        dict chứa peaks và thông tin
    """
    channel_array = np.array(channel_data)
    
    # Tự động tính min_height nếu không được cung cấp
    if min_height is None:
        std_val = np.std(channel_array)
        mean_val = np.mean(channel_array)
        min_height = mean_val + 2 * std_val
    
    # Tự động tính min_distance nếu không được cung cấp
    if min_distance is None:
        # Giả sử tần số lấy mẫu khoảng 1000 Hz, khoảng cách tối thiểu 0.5s
        min_distance = max(1, len(channel_array) // 200)
    
    # Tìm peaks
    peaks, properties = find_peaks(
        channel_array,
        height=min_height,
        distance=min_distance
    )
    
    # Lấy thông tin peaks
    peak_heights = channel_array[peaks]
    peak_times = np.array(time_data)[peaks] if len(time_data) == len(channel_array) else peaks
    
    return {
        "indices": peaks.tolist(),
        "heights": peak_heights.tolist(),
        "times": peak_times.tolist(),
        "count": len(peaks)
    }


def calculate_baseline(channel_data, method='median'):
    """
    Tính baseline của tín hiệu
    
    Args:
        channel_data: Mảng dữ liệu channel
        method: Phương pháp tính ('mean', 'median', 'mode')
        
    Returns:
        Giá trị baseline
    """
    channel_array = np.array(channel_data)
    
    if method == 'mean':
        return float(np.mean(channel_array))
    elif method == 'median':
        return float(np.median(channel_array))
    elif method == 'mode':
        # Tính mode gần đúng
        hist, bins = np.histogram(channel_array, bins=100)
        mode_idx = np.argmax(hist)
        return float(bins[mode_idx])
    else:
        return float(np.mean(channel_array))


def calculate_heart_rate(peaks_data, time_data):
    """
    Tính nhịp tim từ peaks
    
    Args:
        peaks_data: dict chứa thông tin peaks
        time_data: Mảng thời gian
        
    Returns:
        Heart rate (bpm) hoặc None nếu không đủ dữ liệu
    """
    if peaks_data["count"] < 2:
        return None
    
    peak_times = peaks_data["times"]
    if len(peak_times) < 2:
        return None
    
    # Tính khoảng thời gian giữa các peaks
    intervals = np.diff(peak_times)
    
    if len(intervals) == 0:
        return None
    
    # Tính trung bình khoảng thời gian (giây)
    mean_interval = np.mean(intervals)
    
    if mean_interval <= 0:
        return None
    
    # Chuyển đổi sang bpm (beats per minute)
    heart_rate = 60.0 / mean_interval
    
    return float(heart_rate)


def calculate_statistics(channel_data):
    """
    Tính các thống kê cơ bản
    
    Args:
        channel_data: Mảng dữ liệu channel
        
    Returns:
        dict chứa các thống kê
    """
    channel_array = np.array(channel_data)
    
    return {
        "mean": float(np.mean(channel_array)),
        "std": float(np.std(channel_array)),
        "min": float(np.min(channel_array)),
        "max": float(np.max(channel_array)),
        "median": float(np.median(channel_array)),
        "range": float(np.max(channel_array) - np.min(channel_array))
    }


def calculate_snr(channel_data):
    """
    Tính Signal-to-Noise Ratio
    
    Args:
        channel_data: Mảng dữ liệu channel
        
    Returns:
        SNR (dB)
    """
    channel_array = np.array(channel_data)
    
    # Tính signal power (variance)
    signal_power = np.var(channel_array)
    
    # Ước tính noise power từ high-frequency components
    # Sử dụng FFT để tách high frequency
    fft_data = np.fft.fft(channel_array)
    fft_freq = np.fft.fftfreq(len(channel_array))
    
    # High frequency components (> 0.3 normalized frequency)
    high_freq_mask = np.abs(fft_freq) > 0.3
    noise_power = np.var(np.abs(fft_data[high_freq_mask]))
    
    if noise_power == 0:
        return float('inf')
    
    snr_linear = signal_power / noise_power
    snr_db = 10 * np.log10(snr_linear)
    
    return float(snr_db)


def calculate_frequency_domain(channel_data, time_data):
    """
    Phân tích miền tần số
    
    Args:
        channel_data: Mảng dữ liệu channel
        time_data: Mảng thời gian
        
    Returns:
        dict chứa thông tin tần số
    """
    channel_array = np.array(channel_data)
    
    # Tính sampling rate
    if len(time_data) > 1:
        dt = np.mean(np.diff(time_data))
        if dt > 0:
            sampling_rate = 1.0 / dt
        else:
            sampling_rate = 1000.0  # Default
    else:
        sampling_rate = 1000.0
    
    # FFT
    fft_data = np.fft.fft(channel_array)
    fft_freq = np.fft.fftfreq(len(channel_array), d=1.0/sampling_rate)
    
    # Chỉ lấy phần dương
    positive_freq_idx = fft_freq > 0
    positive_freq = fft_freq[positive_freq_idx]
    positive_fft = np.abs(fft_data[positive_freq_idx])
    
    # Tìm dominant frequency
    if len(positive_fft) > 0:
        dominant_freq_idx = np.argmax(positive_fft)
        dominant_freq = positive_freq[dominant_freq_idx]
    else:
        dominant_freq = 0.0
    
    return {
        "sampling_rate": float(sampling_rate),
        "dominant_frequency": float(dominant_freq),
        "max_frequency": float(np.max(positive_freq)) if len(positive_freq) > 0 else 0.0
    }


def calculate_all_metrics(processed_data):
    """
    Tính toán tất cả metrics cho cả 3 channels
    - Channel 1: PCG (Phonocardiogram)
    - Channel 2: PPG (Photoplethysmgram)
    - Channel 3: ECG (Electrocardiogram)
    
    Args:
        processed_data: dict chứa time, channel1, channel2, channel3
        
    Returns:
        dict chứa tất cả metrics
    """
    time = processed_data["time"]
    channel1 = processed_data["channel1"]
    channel2 = processed_data["channel2"]
    channel3 = processed_data["channel3"]
    
    results = {
        "channel1": {},
        "channel2": {},
        "channel3": {},
        "overall": {}
    }
    
    # Xử lý từng channel
    for i, channel_data in enumerate([channel1, channel2, channel3], 1):
        channel_key = f"channel{i}"
        
        # Statistics
        results[channel_key]["statistics"] = calculate_statistics(channel_data)
        
        # Baseline
        results[channel_key]["baseline"] = calculate_baseline(channel_data)
        
        # Peaks
        results[channel_key]["peaks"] = detect_peaks(channel_data, time)
        
        # Heart rate (nếu có peaks)
        if results[channel_key]["peaks"]["count"] >= 2:
            hr = calculate_heart_rate(results[channel_key]["peaks"], time)
            results[channel_key]["heart_rate"] = hr
        else:
            results[channel_key]["heart_rate"] = None
        
        # SNR
        results[channel_key]["snr"] = calculate_snr(channel_data)
        
        # Frequency domain
        results[channel_key]["frequency"] = calculate_frequency_domain(channel_data, time)
    
    # Overall metrics
    all_channels = np.concatenate([channel1, channel2, channel3])
    results["overall"] = {
        "total_samples": len(time),
        "duration": float(time[-1] - time[0]) if len(time) > 1 else 0.0,
        "mean_amplitude": float(np.mean(all_channels)),
        "std_amplitude": float(np.std(all_channels))
    }
    
    return results


def calculate_hr(ri, ri_next):
    """
    Tính Heart Rate từ R peaks
    
    Công thức:
    RR_i = R_i+1 - R_i
    HR_i = 60 / RR_i
    
    Args:
        ri: R_i (seconds)
        ri_next: R_i+1 (seconds)
        
    Returns:
        Heart Rate (bpm)
    """
    rr_i = ri_next - ri
    if rr_i <= 0:
        raise ValueError("R_i+1 must be greater than R_i")
    hr = 60.0 / rr_i
    return float(hr)


def calculate_ptt(foot_j, r_j):
    """
    Tính Pulse Transit Time
    
    Công thức:
    PTT_i = foot_i - R_i
    
    Args:
        foot_j: foot_j (seconds)
        r_j: R_j (seconds)
        
    Returns:
        Pulse Transit Time (seconds)
    """
    ptt = foot_j - r_j
    return float(ptt)


def calculate_mbp(h, ptt):
    """
    Tính Mean Blood Pressure
    
    Công thức:
    MBP = (1.947 * h² / PTT²) + 31.84 * h
    
    Args:
        h: h (meters)
        ptt: Pulse Transit Time (seconds)
        
    Returns:
        Mean Blood Pressure (mmHg)
    """
    if ptt <= 0:
        raise ValueError("PTT must be greater than 0")
    mbp = (1.947 * (h ** 2) / (ptt ** 2)) + 31.84 * h
    return float(mbp)


def calculate_all_manual(ri, ri_next, foot_j, r_j, h):
    """
    Tính toán tất cả các giá trị HR, PTT, MBP từ input
    
    Args:
        ri: R_i (seconds)
        ri_next: R_i+1 (seconds)
        foot_j: foot_j (seconds)
        r_j: R_j (seconds)
        h: h (meters)
        
    Returns:
        dict chứa hr, ptt, mbp
    """
    hr = calculate_hr(ri, ri_next)
    ptt = calculate_ptt(foot_j, r_j)
    mbp = calculate_mbp(h, ptt)
    
    return {
        "hr": hr,
        "ptt": ptt,
        "mbp": mbp
    }


if __name__ == "__main__":
    # Test
    import json
    import sys
    
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f:
            processed_data = json.load(f)
        
        metrics = calculate_all_metrics(processed_data)
        print(json.dumps(metrics, indent=2))

