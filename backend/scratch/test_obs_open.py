import cv2
import time
import os

print("=== TESTING OBS VIRTUAL CAMERA OPENING AND FRAME GRABBING ===")

for idx in [0, 1, 2, 3]:
    print(f"\n--- Testing Camera Index [{idx}] ---")
    
    # Test DSHOW
    cap_dshow = cv2.VideoCapture(idx, cv2.CAP_DSHOW)
    if cap_dshow.isOpened():
        ret, frame = cap_dshow.read()
        print(f"Index {idx} DSHOW opened=True, read={ret}")
        if ret and frame is not None:
            print(f"  Frame shape: {frame.shape[:2]}, mean pixel value: {frame.mean():.2f}")
        cap_dshow.release()
    else:
        print(f"Index {idx} DSHOW opened=False")

    # Test ANY
    cap_any = cv2.VideoCapture(idx, cv2.CAP_ANY)
    if cap_any.isOpened():
        ret, frame = cap_any.read()
        print(f"Index {idx} ANY opened=True, read={ret}")
        if ret and frame is not None:
            print(f"  Frame shape: {frame.shape[:2]}, mean pixel value: {frame.mean():.2f}")
        cap_any.release()
    else:
        print(f"Index {idx} ANY opened=False")

print("\n=== TEST COMPLETED ===")
