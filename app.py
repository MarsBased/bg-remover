from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import requests
from rembg import remove, new_session
from PIL import Image
import io
import os
import onnxruntime as ort

app = FastAPI(title="Background Remover API")

# Configurar la sesión de rembg para usar GPU
providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]
session = new_session("u2net", providers=providers)

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}

@app.get("/diagnostics")
async def diagnostics():
    """
    Diagnostic endpoint to check GPU usage
    """
    available_providers = ort.get_available_providers()
    current_provider = session.providers[0] if session.providers else "None"
    
    return {
        "available_providers": available_providers,
        "configured_providers": providers,
        "current_provider": current_provider,
        "gpu_available": "CUDAExecutionProvider" in available_providers,
        "cuda_version": os.environ.get("CUDA_VERSION", "Not set"),
        "cuda_path": os.environ.get("CUDA_PATH", "Not set")
    }

@app.post("/remove-bg")
async def remove_background(image_url: str):
    """
    Remove background from image
    """
    try:
        # Download image from URL
        response = requests.get(image_url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Could not download image from URL")
        
        # Convert to PIL Image
        input_image = Image.open(io.BytesIO(response.content))
        
        # Remove background using the configured session
        output_image = remove(input_image, session=session)
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(img_byte_arr, media_type="image/png")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 