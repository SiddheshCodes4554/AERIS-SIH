import asyncio
import time
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

# Test async generator vs sync endpoint
def sync_generator():
    for i in range(5):
        time.sleep(0.05)
        yield b"chunk"

@app.get("/test-sync")
def test_sync(): # Notice def (not async def) allows threadpool execution in Starlette
    return StreamingResponse(sync_generator())

async def async_generator():
    for i in range(5):
        await asyncio.sleep(0.05)
        yield b"chunk"

@app.get("/test-async")
async def test_async():
    return StreamingResponse(async_generator())
