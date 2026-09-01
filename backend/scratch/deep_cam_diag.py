import cv2
import time
import os

print("=== DEEP CAMERA HARDWARE DIAGNOSTIC ===")

for idx in [0, 1, 2, 3]:
    print(f"\n--- Checking Device Index {idx} ---")
    for b_name, b_val in [("DSHOW", cv2.CAP_DSHOW), ("MSMF", cv2.CAP_MSMF), ("ANY", cv2.CAP_ANY)]:
        try:
            t0 = time.time()
            cap = cv2.VideoCapture(idx, b_val)
            opened = cap.isOpened()
            dt = time.time() - t0
            print(f"  [{b_name}] isOpened: {opened} (took {dt:.2f}s)")
            if opened:
                for f_i in range(5):
                    t_f0 = time.time()
                    ret, frame = cap.read()
                    t_f1 = time.time()
                    if ret and frame is not None:
                        h, w = frame.shape[:2]
                        print(f"    Frame {f_i}: SUCCESS -> {w}x{h} in {(t_f1 - t_f0)*1000:.1f}ms")
                    else:
                        print(f"    Frame {f_i}: FAILED (ret={ret}) in {(t_f1 - t_f0)*1000:.1f}ms")
                cap.release()
        except Exception as e:
            print(f"  [{b_name}] Exception: {e}")
