import cv2
import time

print("Testing VideoCapture(1, cv2.CAP_DSHOW) frame sequence:")
cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
print("isOpened:", cap.isOpened())

for i in range(15):
    ret, frame = cap.read()
    print(f"  Frame {i}: ret={ret}, shape={frame.shape if ret else None}")
    time.sleep(0.05)

cap.release()
