from ultralytics import YOLO

model = YOLO('yolov8n.pt') 


results = model.train(
    data=r'D:\nam4\AI_rubbish\dataset\data.yaml',  
    epochs=20,           
    imgsz=640, 
    patience=10,          
    batch=-1,       
    workers=8,      
    name='multitrash_28_classes'
)

model = YOLO(r'D:\nam4\AI_rubbish\runs\detect\multitrash_28_classes7\weights\best.pt')

results = model.predict(source=r'D:\nam4\AI_rubbish\dataset\test\images', save=True, show=True)

print("huan luyen xong")
            