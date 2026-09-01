import cv2
import os

print("OpenCV Version:", cv2.__version__)

for backend_name, backend in [("CAP_DSHOW", cv2.CAP_DSHOW), ("CAP_MSMF", cv2.CAP_MSMF), ("DEFAULT", None)]:
    print(f"\n--- Testing Backend: {backend_name} ---")
    for idx in range(4):
        if backend is not None:
            cap = cv2.VideoCapture(idx, backend)
        else:
            cap = cv2.VideoCapture(idx)
        
        opened = cap.isOpened()
        ret, frame = (False, None)
        if opened:
            ret, frame = cap.read()
            shape = frame.shape if (ret and frame is not None) else None
            print(f"  Camera index {idx}: isOpened=True, read={ret}, shape={shape}")
            cap.release()
        else:
            print(f"  Camera index {idx}: isOpened=False")
