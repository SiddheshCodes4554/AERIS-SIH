import cv2
import time

print("Testing Phone Link without forcing 1280x720:")
cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
print("isOpened:", cap.isOpened())
for i in range(10):
    ret, frame = cap.read()
    print(f"  Frame {i}: ret={ret}, shape={frame.shape if ret else None}")
    time.sleep(0.05)
cap.release()

print("\nTesting Phone Link WITH forcing 1280x720:")
cap2 = cv2.VideoCapture(1, cv2.CAP_DSHOW)
cap2.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap2.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
print("isOpened after set:", cap2.isOpened())
for i in range(10):
    ret, frame = cap2.read()
    print(f"  Frame {i}: ret={ret}, shape={frame.shape if ret else None}")
    time.sleep(0.05)
cap2.release()
