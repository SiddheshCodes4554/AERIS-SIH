import cv2
import threading
import time
import numpy as np

class FixedCameraService:
    def __init__(self, camera_index=1):
        self.camera_index = camera_index
        self.cap = None
        self.is_running = True
        self.is_camera_available = False
        self.latest_frame = None
        self.cap_lock = threading.Lock()
        self.frame_lock = threading.Lock()

    def _open_camera(self, idx):
        try:
            cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW)
            if cap and cap.isOpened():
                for _ in range(5):
                    ret, f = cap.read()
                    if ret and f is not None and f.size > 0:
                        return cap
                    time.sleep(0.03)
                cap.release()
        except Exception as e:
            print("Failed to open:", e)
        return None

    def _capture_loop(self):
        print("Capture loop running...")
        frame_count = 0
        while self.is_running:
            with self.cap_lock:
                if self.cap is None or not self.cap.isOpened():
                    self.cap = self._open_camera(self.camera_index)
                    self.is_camera_available = (self.cap is not None)
                cap = self.cap

            if cap is None:
                print("In standby...")
                time.sleep(0.5)
                continue

            try:
                ret, frame = cap.read()
                if ret and frame is not None and frame.size > 0:
                    self.is_camera_available = True
                    frame_count += 1
                    with self.frame_lock:
                        self.latest_frame = frame
                    if frame_count % 10 == 0:
                        print(f"  Successfully captured frame #{frame_count} -> {frame.shape}")
                else:
                    print("Read failed, resetting...")
                    with self.cap_lock:
                        if self.cap:
                            self.cap.release()
                            self.cap = None
                    self.is_camera_available = False
                    time.sleep(0.2)
            except Exception as e:
                print("Capture error:", e)
                time.sleep(0.1)

            time.sleep(0.02)

cam = FixedCameraService(camera_index=1)
t = threading.Thread(target=cam._capture_loop, daemon=True)
t.start()

time.sleep(3.0)
cam.is_running = False
t.join(timeout=1.0)
print("Finished test successfully!")
