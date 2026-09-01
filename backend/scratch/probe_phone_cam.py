import cv2
import os

print("--- Probing all Windows Camera Devices (Indices 0 to 6) ---")

backends = [
    ("CAP_MSMF", cv2.CAP_MSMF),
    ("CAP_DSHOW", cv2.CAP_DSHOW),
    ("CAP_ANY", cv2.CAP_ANY)
]

for idx in range(7):
    print(f"\nDevice Index {idx}:")
    for b_name, b_val in backends:
        try:
            cap = cv2.VideoCapture(idx, b_val)
            if cap and cap.isOpened():
                ret, frame = cap.read()
                if ret and frame is not None:
                    print(f"  [{b_name}] SUCCESS -> Resolution: {frame.shape[1]}x{frame.shape[0]}, Channels: {frame.shape[2]}")
                else:
                    print(f"  [{b_name}] Opened but read() returned False")
                cap.release()
            else:
                print(f"  [{b_name}] Failed to open")
        except Exception as e:
            print(f"  [{b_name}] Error: {e}")
