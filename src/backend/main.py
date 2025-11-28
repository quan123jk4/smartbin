from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import json 

app = FastAPI()
filtered_data = []
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép TẤT CẢ các trang web truy cập (bao gồm Vercel)
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các method (GET, POST...)
    allow_headers=["*"],  # Cho phép tất cả các header
)
model_path = r"D:\nam4\AI_rubbish\runs\detect\multitrash_28_classes7\weights\best.pt"
try:
    model = YOLO(model_path)
except:
    model = YOLO("yolov8n.pt")
@app.post("/detect/")
async def detect_waste(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        img = Image.open(io.BytesIO(image_bytes))
        results = model(img, conf=0.6) 
        json_str = results[0].to_json()
        raw_data = json.loads(json_str)
        filtered_data = []
        for item in raw_data:
            if 'box' in item:
                box = item['box']
                width = box['x2'] - box['x1']
                height = box['y2'] - box['y1']
                area = width * height
                if area > 5000:
                    filtered_data.append(item)
        return filtered_data 
    except Exception as e:
        return {"error": str(e)}