import cv2
import os

print("=== PROBING ALL CAMERA INDICES (0-5) ON WINDOWS ===")

for i in range(6):
    cap_dshow = cv2.VideoCapture(i, cv2.CAP_DSHOW)
    opened_dshow = cap_dshow.isOpened() if cap_dshow else False
    ret_dshow = False
    shape_dshow = None
    if opened_dshow:
        ret_dshow, frame = cap_dshow.read()
        if ret_dshow and frame is not None:
            shape_dshow = frame.shape[:2]
        cap_dshow.release()

    cap_any = cv2.VideoCapture(i, cv2.CAP_ANY)
    opened_any = cap_any.isOpened() if cap_any else False
    ret_any = False
    shape_any = None
    if opened_any:
        ret_any, frame = cap_any.read()
        if ret_any and frame is not None:
            shape_any = frame.shape[:2]
        cap_any.release()

    print(f"Camera [{i}]: DSHOW opened={opened_dshow}, read={ret_dshow}, size={shape_dshow} | ANY opened={opened_any}, read={ret_any}, size={shape_any}")
