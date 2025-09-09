#!/usr/bin/env python3
"""
Download the trained BioBERT model from Google Drive
Run this after mounting your Google Drive in Colab and copying the model
"""

import os
import shutil
from pathlib import Path

def download_model():
    # Source paths (adjust these to match your Google Drive structure)
    drive_model_path = "/content/drive/MyDrive/models/symptom_disease_model"
    local_model_path = "models/symptom_disease_model"
    
    # Create local models directory
    os.makedirs("models", exist_ok=True)
    
    if os.path.exists(drive_model_path):
        print(f"Copying model from {drive_model_path} to {local_model_path}")
        shutil.copytree(drive_model_path, local_model_path, dirs_exist_ok=True)
        print("✅ Model copied successfully!")
        
        # List contents
        print("\nModel contents:")
        for root, dirs, files in os.walk(local_model_path):
            for file in files:
                print(f"  {os.path.join(root, file)}")
    else:
        print(f"❌ Model not found at {drive_model_path}")
        print("Please ensure you've:")
        print("1. Mounted Google Drive in Colab")
        print("2. Trained the model and saved it to the correct path")
        print("3. Run this script from the Colab notebook")

if __name__ == "__main__":
    download_model()
