import cv2
import numpy as np

for idx in [0, 1]:
    cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW)
    if cap.isOpened():
        ret, frame = cap.read()
        if ret and frame is not None:
            mean_val = np.mean(frame)
            max_val = np.max(frame)
            min_val = np.min(frame)
            print(f"Camera {idx}: shape={frame.shape}, min={min_val}, max={max_val}, mean={mean_val:.2f}")
            cv2.imwrite(f"test_frame_cam_{idx}.jpg", frame)
        else:
            print(f"Camera {idx}: read() failed (ret={ret})")
        cap.release()
    else:
        print(f"Camera {idx}: isOpened() is False")
