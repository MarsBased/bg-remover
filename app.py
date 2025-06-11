from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import requests
from rembg import remove
from PIL import Image
import io

app = FastAPI(title="Background Remover API")

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}

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
        
        # Remove background
        output_image = remove(input_image)
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(img_byte_arr, media_type="image/png")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 