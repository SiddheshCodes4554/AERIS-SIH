import cv2
import threading
import time

class BuggyCamera:
    def __init__(self):
        self.cap = None
        self.is_running = True
        self.is_camera_available = False

    def _open_camera(self):
        return cv2.VideoCapture(1, cv2.CAP_DSHOW)

    def _capture_loop(self):
        print("Thread started")
        while self.is_running:
            cap_ref = self.cap
            if cap_ref is None or not cap_ref.isOpened():
                new_cap = self._open_camera()
                if new_cap:
                    self.cap = new_cap
                    self.is_camera_available = True
                    # Notice cap_ref was not updated!
            
            try:
                ret, frame = cap_ref.read() # <--- CRASHES HERE WITH NoneType!
                print("Read frame:", ret)
            except Exception as e:
                print("CRASHED IN THREAD:", e)
                break
            time.sleep(0.1)

c = BuggyCamera()
t = threading.Thread(target=c._capture_loop)
t.start()
t.join()
