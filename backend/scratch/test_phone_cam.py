import cv2

print("Testing Camera 0:")
cap0 = cv2.VideoCapture(0, cv2.CAP_DSHOW)
print("Cap 0 isOpened:", cap0.isOpened())
if cap0.isOpened():
    ret, frame = cap0.read()
    print("Cap 0 read:", ret, frame.shape if ret else None)
    cap0.release()

print("\nTesting Camera 1 (Phone Link / Virtual Camera):")
for b_name, b in [("DSHOW", cv2.CAP_DSHOW), ("MSMF", cv2.CAP_MSMF), ("ANY", cv2.CAP_ANY)]:
    cap1 = cv2.VideoCapture(1, b)
    print(f"Cap 1 ({b_name}) isOpened:", cap1.isOpened())
    if cap1.isOpened():
        ret, frame = cap1.read()
        print(f"Cap 1 ({b_name}) read:", ret, frame.shape if ret else None)
        cap1.release()
