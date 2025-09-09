# Integration Files for Nabhacare Telemedicine

This directory contains all the files needed to integrate your symptom checker with the [Nabhacare Telemedicine](https://github.com/ethancodes-6969/nabhacare-telemedicine.git) system.

## 📁 Files Included

- `symptom_api_wrapper.js` - Simple API wrapper for their backend
- `voice_integration_example.js` - Complete voice-to-symptom analysis pipeline
- `docker-compose.yml` - Docker setup for running both services
- `README.md` - This file

## 🚀 Quick Integration Steps

### 1. Copy Files to Their Repository
```bash
# Clone their repository
git clone https://github.com/ethancodes-6969/nabhacare-telemedicine.git
cd nabhacare-telemedicine
git checkout whisper-classifier-integration

# Copy integration files
cp /path/to/your/symptom_checker/integration/* ./backend/services/
```

### 2. Install Dependencies
```bash
cd nabhacare-telemedicine/backend
npm install axios multer
```

### 3. Update Their Voice Controller
Add this to their existing voice processing:

```javascript
const VoiceSymptomAnalyzer = require('./services/voice_integration_example');
const voiceAnalyzer = new VoiceSymptomAnalyzer('http://localhost:8000');

// In their voice processing function:
const result = await voiceAnalyzer.processVoiceToSymptoms(audioBuffer, userInfo);
```

### 4. Start Your Symptom Checker
```bash
cd /path/to/your/symptom_checker
source .venv/bin/activate
PYTHONPATH=. uvicorn app.main_biobert:app --host 0.0.0.0 --port 8000
```

### 5. Test Integration
```bash
# Test the API directly
curl -X POST http://localhost:8000/analyze \
  -H 'Content-Type: application/json' \
  -d '{"symptoms": "I have fever and cough", "age": 30, "gender": "Male"}'
```

## 🔧 Configuration

### Environment Variables
Add to their `.env` file:
```bash
SYMPTOM_CHECKER_API=http://localhost:8000
```

### API Endpoints
- **Your API**: `http://localhost:8000/analyze`
- **Their API**: `http://localhost:3000/api/analyze-voice`

## 📱 Mobile App Integration

For their mobile app, use this API call:

```javascript
const analyzeVoice = async (audioFile, userInfo) => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('age', userInfo.age);
  formData.append('gender', userInfo.gender);

  const response = await fetch('http://localhost:3000/api/analyze-voice', {
    method: 'POST',
    body: formData
  });

  return await response.json();
};
```

## 🐳 Docker Deployment

Use the provided `docker-compose.yml`:

```bash
# Start both services
docker-compose up -d

# Check logs
docker-compose logs -f symptom-checker
docker-compose logs -f nabhacare-backend
```

## 🧪 Testing

### Test Voice Input
1. Record a voice message (Hindi/English)
2. Send to their API endpoint
3. Verify transcription and symptom analysis

### Test API Health
```bash
curl http://localhost:8000/health
curl http://localhost:3000/api/health
```

## 📊 Expected Workflow

1. **User speaks** symptoms in Hindi/English
2. **Whisper converts** voice to English text
3. **Your model analyzes** symptoms and predicts diseases
4. **System returns** predictions with confidence scores
5. **User gets** treatment recommendations and next steps

## 🔍 Troubleshooting

### Common Issues
1. **API not responding**: Check if symptom checker is running on port 8000
2. **Model not found**: Ensure model files are in the correct directory
3. **CORS errors**: Add CORS headers to your FastAPI app
4. **Timeout errors**: Increase timeout in the API wrapper

### Debug Mode
Enable debug logging in the API wrapper:
```javascript
const symptomAPI = new SymptomCheckerAPI('http://localhost:8000');
// Add console.log statements to debug
```

## 📞 Support

- Check the main `INTEGRATION_GUIDE.md` for detailed instructions
- Verify your symptom checker is working independently first
- Test with simple text input before trying voice integration

This integration maintains their existing voice processing while adding your powerful symptom analysis capabilities!
