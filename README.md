# Symptom Checker (Production-Ready)

Two approaches: **BioBERT fine-tuned model** (86% accuracy) or **PubMedBERT + Logistic Regression** pipeline.

## 🚀 BioBERT Approach (Recommended)

**Performance**: 86.2% accuracy, 96.6% top-3 accuracy on 24 diseases

### Quickstart

1. **Setup**
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

2. **Download your trained model** (from Colab)
```bash
# In Colab, after training:
python download_model.py
```

3. **Run BioBERT API**
```bash
PYTHONPATH=. uvicorn app.main_biobert:app --host 0.0.0.0 --port 8000
```

4. **Test with treatment recommendations**
```bash
curl -X POST http://localhost:8000/analyze \
  -H 'Content-Type: application/json' \
  -d '{"symptoms": "I have been experiencing a skin rash on my arms and legs. It is red, itchy, and covered in dry, scaly patches.", "age": 35, "gender": "Female"}'
```

**Response includes treatments:**
```json
{
  "predictions": [
    {
      "disease": "Psoriasis", 
      "confidence": 0.89,
      "treatment": "Topical corticosteroids, moisturizers, and phototherapy"
    },
    {
      "disease": "Fungal infection", 
      "confidence": 0.08,
      "treatment": "Antifungal creams and oral medications"
    }
  ],
  "next_step": "Consult a General Physician"
}
```

### Model Optimization (Optional)

```bash
# Convert to ONNX for faster inference
python optimize_model.py

# Creates:
# - models/optimized/symptom_model.onnx (ONNX format)
# - models/optimized/symptom_model_lightweight (half precision)
```

---

## 🔧 PubMedBERT + Logistic Regression Approach

For comparison or if you prefer the embedding-based approach:

1. **Train**
```bash
# Single CSV
PYTHONPATH=. python training/train.py --data data/Symptom2Disease.csv --artifacts artifacts

# Multiple CSVs with k-fold
PYTHONPATH=. python training/train.py --data data/rural.csv data/global.csv --kfolds 5 --artifacts artifacts
```

2. **Run API**
```bash
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📊 Dataset Format

Required columns: `Disease, Symptoms, Treatments`
- **Disease**: Target label (24 classes)
- **Symptoms**: Free-text symptom description  
- **Treatments**: Treatment recommendations (optional)

## 🎯 Deployment Options

### Cloud API (Recommended)
- Deploy FastAPI on AWS/GCP/Azure
- Mobile app calls API endpoint
- Easy to update model

### Mobile Offline
- Use ONNX model in mobile app
- Works without internet (rural areas)
- Requires model conversion

## 📈 Performance

| Approach | Accuracy | Top-3 Accuracy | Model Size |
|----------|----------|----------------|------------|
| BioBERT Fine-tuned | 86.2% | 96.6% | ~440MB |
| PubMedBERT + LR | ~60-70% | ~85-90% | ~440MB + artifacts |

**Recommendation**: Use BioBERT approach for production telemedicine app.