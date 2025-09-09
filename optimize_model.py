#!/usr/bin/env python3
"""
Model optimization for deployment
- Convert to ONNX for faster inference
- Create a lightweight version for mobile deployment
"""

import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import joblib

def convert_to_onnx(model_path: str, output_path: str):
    """Convert BioBERT model to ONNX format for faster inference"""
    print("Converting model to ONNX...")
    
    # Load model and tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    model.eval()
    
    # Create dummy input
    dummy_text = "I have fever and cough"
    inputs = tokenizer(dummy_text, return_tensors="pt", truncation=True, padding=True, max_length=256)
    
    # Export to ONNX
    torch.onnx.export(
        model,
        (inputs["input_ids"], inputs["attention_mask"]),
        output_path,
        export_params=True,
        opset_version=11,
        do_constant_folding=True,
        input_names=["input_ids", "attention_mask"],
        output_names=["logits"],
        dynamic_axes={
            "input_ids": {0: "batch_size"},
            "attention_mask": {0: "batch_size"},
            "logits": {0: "batch_size"}
        }
    )
    print(f"✅ ONNX model saved to {output_path}")

def create_lightweight_model(model_path: str, output_path: str):
    """Create a lightweight version by reducing precision"""
    print("Creating lightweight model...")
    
    # Load model
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    
    # Convert to half precision
    model.half()
    
    # Save lightweight version
    os.makedirs(output_path, exist_ok=True)
    model.save_pretrained(output_path)
    tokenizer.save_pretrained(output_path)
    
    # Copy label encoder
    label_encoder_path = os.path.join(model_path, "label_encoder.pkl")
    if os.path.exists(label_encoder_path):
        import shutil
        shutil.copy2(label_encoder_path, output_path)
    
    print(f"✅ Lightweight model saved to {output_path}")

def main():
    model_path = "models/symptom_disease_model"
    
    if not os.path.exists(model_path):
        print(f"❌ Model not found at {model_path}")
        print("Please run download_model.py first or copy your trained model there")
        return
    
    # Create optimized models directory
    os.makedirs("models/optimized", exist_ok=True)
    
    # Convert to ONNX
    onnx_path = "models/optimized/symptom_model.onnx"
    convert_to_onnx(model_path, onnx_path)
    
    # Create lightweight version
    lightweight_path = "models/optimized/symptom_model_lightweight"
    create_lightweight_model(model_path, lightweight_path)
    
    print("\n🎉 Model optimization complete!")
    print("Files created:")
    print(f"  - ONNX model: {onnx_path}")
    print(f"  - Lightweight model: {lightweight_path}")

if __name__ == "__main__":
    main()
