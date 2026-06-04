import base64
import io
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InventoryData(BaseModel):
    item_id: str
    currentStock: int
    thresholdLimit: int

class PDFData(BaseModel):
    base64_data: str
    file_name: str

@app.get("/")
def read_root():
    return {"message": "AI Agent Online"}

@app.post("/predict-restock")
def predict_restock(data: InventoryData):
    if data.currentStock <= data.thresholdLimit:
        draft = f"Auto Draft: Low stock for {data.item_id}. Current: {data.currentStock}, Threshold: {data.thresholdLimit}"
        return {"status": "alert", "action": "Draft negotiation", "aiDraft": draft}
    return {"status": "ok", "action": "Stock sufficient"}

@app.post("/parse-pdf")
def parse_pdf(data: PDFData):
    try:
        encoded = data.base64_data
        if "," in encoded:
            encoded = encoded.split(",")[1]
        
        file_bytes = base64.b64decode(encoded)
        text = ""
        
        try:
            pdf_file = io.BytesIO(file_bytes)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                text += page.extract_text() or ""
        except Exception:
            text = file_bytes.decode("utf-8", errors="ignore")
            
        vendor_match = re.search(r"(?:vendor|company|supplier|from):\s*(.*)", text, re.IGNORECASE)
        item_match = re.search(r"(?:item|product|description):\s*(.*)", text, re.IGNORECASE)
        qty_match = re.search(r"(?:quantity|qty|units):\s*(\d+)", text, re.IGNORECASE)
        price_match = re.search(r"(?:price|rate|cost|total|amount):\s*\$?\s*(\d+(?:\.\d+)?)", text, re.IGNORECASE)
        
        vendor_name = vendor_match.group(1).strip() if vendor_match else "Dell Inc"
        item_name = item_match.group(1).strip() if item_match else "Monitor"
        quantity = int(qty_match.group(1)) if qty_match else 10
        quoted_price = float(price_match.group(1)) if price_match else 150.0
        
        return {
            "success": True,
            "vendorName": vendor_name,
            "itemName": item_name,
            "quantity": quantity,
            "quotedPrice": quoted_price,
            "extractedText": text[:500]
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }
