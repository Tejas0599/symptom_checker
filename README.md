# Symptom Checker (Hackathon-Ready)

Minimal pipeline: PubMedBERT embeddings + Logistic Regression + rule-based triage, served via FastAPI.

## Quickstart

1. Create a virtualenv and install deps
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

2. Train (uses tiny seed dataset)
```bash
python training/train.py --data training/seed_dataset.csv --artifacts artifacts
```
This downloads PubMedBERT, embeds the dataset, trains a classifier, and saves `artifacts/classifier.joblib` and `artifacts/labels.joblib`.

3. Run API
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

4. Test endpoint
```bash
curl -X POST http://localhost:8000/analyze \
  -H 'Content-Type: application/json' \
  -d '{"symptoms": "Fever and sore throat", "age": 28, "gender": "Male"}'
```

Example response
```json
{
  "possible_conditions": ["Flu", "COVID-19", "Common Cold"],
  "next_step": "Consult a General Physician"
}
```

## Notes
- Model: `microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext`
- Embedding: mean pooling of last hidden state
- Classifier: scikit-learn LogisticRegression
- Triage: simple rules for demo; expand as needed

## Customize
- Add more rows to `training/seed_dataset.csv` with `text,label`
- Retrain using the same command
- Optionally parameterize model via env vars

## Deploy
- Quick demo: Streamlit/Gradio calling the `/analyze` endpoint
- Cloud: Hugging Face Spaces, Fly.io, or a small VM (2–4 vCPU, 8GB RAM)