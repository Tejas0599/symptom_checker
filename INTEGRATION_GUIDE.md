# Integration Guide: Symptom Checker + Nabhacare Telemedicine

This guide shows how to integrate your symptom checker with the [Nabhacare Telemedicine](https://github.com/ethancodes-6969/nabhacare-telemedicine.git) system.

## 🔄 Integration Flow

```
Voice Input (Hindi/English) → Whisper → English Text → Your Symptom Checker → Disease Prediction + Treatment
```

## 📋 Integration Steps

### 1. Clone Their Repository
```bash
git clone https://github.com/ethancodes-6969/nabhacare-telemedicine.git
cd nabhacare-telemedicine
git checkout whisper-classifier-integration
```

### 2. Add Your Symptom Checker as a Service

Create a new service file in their backend:

```typescript
// backend/services/symptomChecker.ts
import axios from 'axios';

const SYMPTOM_CHECKER_API = process.env.SYMPTOM_CHECKER_API || 'http://localhost:8000';

export interface SymptomPrediction {
  disease: string;
  confidence: number;
  treatment: string;
}

export interface SymptomResponse {
  predictions: SymptomPrediction[];
  next_step: string;
}

export class SymptomCheckerService {
  async analyzeSymptoms(symptoms: string, age?: number, gender?: string): Promise<SymptomResponse> {
    try {
      const response = await axios.post(`${SYMPTOM_CHECKER_API}/analyze`, {
        symptoms,
        age,
        gender
      });
      return response.data;
    } catch (error) {
      console.error('Symptom checker API error:', error);
      throw new Error('Failed to analyze symptoms');
    }
  }
}
```

### 3. Integrate with Their Voice Processing

Modify their voice processing pipeline:

```typescript
// backend/controllers/voiceController.ts
import { SymptomCheckerService } from '../services/symptomChecker';

export class VoiceController {
  private symptomChecker = new SymptomCheckerService();

  async processVoiceInput(audioFile: Buffer, userInfo: {age?: number, gender?: string}) {
    // 1. Convert voice to text using Whisper
    const transcribedText = await this.transcribeAudio(audioFile);
    
    // 2. Analyze symptoms using your model
    const symptomAnalysis = await this.symptomChecker.analyzeSymptoms(
      transcribedText,
      userInfo.age,
      userInfo.gender
    );
    
    // 3. Return combined result
    return {
      transcription: transcribedText,
      analysis: symptomAnalysis,
      timestamp: new Date().toISOString()
    };
  }

  private async transcribeAudio(audioFile: Buffer): Promise<string> {
    // Their existing Whisper implementation
    // This should already be implemented in their codebase
  }
}
```

### 4. Update Frontend to Display Results

```typescript
// frontend/components/SymptomAnalysis.tsx
import React, { useState } from 'react';

interface SymptomAnalysisProps {
  transcription: string;
  analysis: {
    predictions: Array<{
      disease: string;
      confidence: number;
      treatment: string;
    }>;
    next_step: string;
  };
}

export const SymptomAnalysis: React.FC<SymptomAnalysisProps> = ({ transcription, analysis }) => {
  return (
    <div className="symptom-analysis">
      <h3>Voice Input Analysis</h3>
      <p><strong>Transcribed:</strong> {transcription}</p>
      
      <div className="predictions">
        <h4>Possible Conditions:</h4>
        {analysis.predictions.map((pred, index) => (
          <div key={index} className="prediction-card">
            <h5>{pred.disease}</h5>
            <p>Confidence: {(pred.confidence * 100).toFixed(1)}%</p>
            <p>Treatment: {pred.treatment}</p>
          </div>
        ))}
      </div>
      
      <div className="next-steps">
        <h4>Recommended Next Step:</h4>
        <p>{analysis.next_step}</p>
      </div>
    </div>
  );
};
```

### 5. Environment Configuration

Add to their `.env` file:

```bash
# Symptom Checker API
SYMPTOM_CHECKER_API=http://localhost:8000
```

### 6. Docker Integration (Optional)

Create a `docker-compose.yml` to run both services:

```yaml
version: '3.8'
services:
  symptom-checker:
    build: ./symptom_checker
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/app/models/symptom_disease_model
  
  nabhacare-backend:
    build: ./nabhacare-telemedicine/backend
    ports:
      - "3000:3000"
    environment:
      - SYMPTOM_CHECKER_API=http://symptom-checker:8000
    depends_on:
      - symptom-checker
```

## 🚀 Deployment Options

### Option 1: Local Development
1. Run your symptom checker: `uvicorn app.main_biobert:app --host 0.0.0.0 --port 8000`
2. Run their backend with your API URL
3. Test the integration

### Option 2: Cloud Deployment
1. Deploy your symptom checker to AWS/GCP/Azure
2. Update their backend to use your cloud API URL
3. Deploy their full system

### Option 3: Microservices Architecture
1. Deploy symptom checker as a separate microservice
2. Use API gateway to route requests
3. Scale independently

## 📱 Mobile App Integration

For their mobile app, add this API call:

```javascript
// Mobile app integration
const analyzeSymptoms = async (transcribedText, userInfo) => {
  try {
    const response = await fetch('https://your-symptom-checker-api.com/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symptoms: transcribedText,
        age: userInfo.age,
        gender: userInfo.gender
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Symptom analysis failed:', error);
    return null;
  }
};
```

## 🔧 Testing the Integration

1. **Test Voice Input**: Record a Hindi/English voice message
2. **Verify Transcription**: Check if Whisper converts it correctly
3. **Test Symptom Analysis**: Ensure your model processes the text
4. **Check Output**: Verify disease predictions and treatments

## 📊 Expected Workflow

1. User speaks symptoms in Hindi/English
2. Whisper converts to English text
3. Your model analyzes and predicts diseases
4. System shows predictions with confidence scores
5. User gets treatment recommendations and next steps

This integration maintains their existing voice processing while adding your powerful symptom analysis capabilities!
