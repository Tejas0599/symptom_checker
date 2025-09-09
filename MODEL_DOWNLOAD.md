# Model Download Instructions

The trained BioBERT model files are too large for GitHub (>100MB). To use the full model:

## Download from Colab

1. **In your Colab notebook**, run:
```python
import os
import shutil
import zipfile

# Source path
model_path = "/content/drive/MyDrive/models/symptom_disease_model"

# Create zip for download
shutil.make_archive("/content/symptom_disease_model", 'zip', model_path)

# Download
from google.colab import files
files.download('/content/symptom_disease_model.zip')
```

2. **Extract the zip** to: `models/symptom_disease_model/`

3. **Verify files** are present:
   - `config.json` ✅
   - `model.safetensors` ✅ (413MB - this is the large file)
   - `tokenizer.json` ✅
   - `tokenizer_config.json` ✅
   - `vocab.txt` ✅
   - `label_encoder.pkl` ✅
   - `training_args.bin` ✅ (large file)

## Alternative: Use PubMedBERT Approach

If you can't download the large model, use the PubMedBERT + Logistic Regression approach:

```bash
# Train with your dataset
PYTHONPATH=. python training/train.py --data data/Symptom2Disease.csv --artifacts artifacts

# Run API
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000
```

This gives ~60-70% accuracy vs 86% with BioBERT, but works without large files.
