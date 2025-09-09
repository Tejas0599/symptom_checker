#!/usr/bin/env python3
"""
Colab-specific script to download the trained BioBERT model
Run this in your Colab notebook after training
"""

import os
import shutil
from pathlib import Path
from google.colab import drive

def download_model_colab():
    # Mount Google Drive if not already mounted
    try:
        drive.mount('/content/drive')
    except:
        print("Drive already mounted or mounting failed")
    
    # Source paths (adjust these to match your Google Drive structure)
    drive_model_path = "/content/drive/MyDrive/models/symptom_disease_model"
    
    # Create a zip file for easier download
    import zipfile
    
    if os.path.exists(drive_model_path):
        print(f"Found model at {drive_model_path}")
        
        # Create zip file
        zip_path = "/content/drive/MyDrive/symptom_disease_model.zip"
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(drive_model_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, drive_model_path)
                    zipf.write(file_path, arcname)
        
        print(f"✅ Model zipped to {zip_path}")
        print("Download this zip file to your local machine")
        print("Then extract it to: /Users/umeshghodke/Desktop/symptom_checker/models/symptom_disease_model/")
        
        # Also copy to Colab's local directory for testing
        local_path = "/content/symptom_disease_model"
        shutil.copytree(drive_model_path, local_path, dirs_exist_ok=True)
        print(f"✅ Model also copied to {local_path} for local testing")
        
        # List contents
        print("\nModel contents:")
        for root, dirs, files in os.walk(local_path):
            for file in files:
                print(f"  {os.path.join(root, file)}")
                
    else:
        print(f"❌ Model not found at {drive_model_path}")
        print("Please check your model save path in the training notebook")
        print("Expected path: /content/drive/MyDrive/models/symptom_disease_model")

if __name__ == "__main__":
    download_model_colab()
