/**
 * Symptom Checker API Wrapper for Nabhacare Telemedicine Integration
 * This file can be directly added to their backend
 */

const axios = require('axios');

class SymptomCheckerAPI {
  constructor(apiUrl = 'http://localhost:8000') {
    this.apiUrl = apiUrl;
  }

  /**
   * Analyze symptoms from transcribed text
   * @param {string} symptoms - Transcribed symptom text
   * @param {number} age - User age (optional)
   * @param {string} gender - User gender (optional)
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeSymptoms(symptoms, age = null, gender = null) {
    try {
      console.log(`Analyzing symptoms: "${symptoms}"`);
      
      const response = await axios.post(`${this.apiUrl}/analyze`, {
        symptoms: symptoms,
        age: age,
        gender: gender
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Symptom checker API error:', error.message);
      return {
        success: false,
        error: error.message,
        data: {
          predictions: [{
            disease: "Unable to analyze",
            confidence: 0,
            treatment: "Please consult a healthcare provider"
          }],
          next_step: "Consult a General Physician"
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Health check for the symptom checker API
   * @returns {Promise<boolean>} API health status
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.apiUrl}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.error('Symptom checker health check failed:', error.message);
      return false;
    }
  }

  /**
   * Format results for display
   * @param {Object} analysisResult - Raw analysis result
   * @returns {Object} Formatted result
   */
  formatResults(analysisResult) {
    if (!analysisResult.success) {
      return {
        status: 'error',
        message: 'Analysis failed',
        fallback: analysisResult.data
      };
    }

    const { predictions, next_step } = analysisResult.data;
    
    return {
      status: 'success',
      transcription: analysisResult.data.symptoms || 'N/A',
      predictions: predictions.map(pred => ({
        disease: pred.disease,
        confidence: Math.round(pred.confidence * 100),
        treatment: pred.treatment
      })),
      nextStep: next_step,
      topPrediction: predictions[0]?.disease || 'Unknown',
      confidence: Math.round(predictions[0]?.confidence * 100) || 0
    };
  }
}

module.exports = SymptomCheckerAPI;

// Example usage:
/*
const SymptomCheckerAPI = require('./symptom_api_wrapper');
const symptomAPI = new SymptomCheckerAPI('http://localhost:8000');

// Test the integration
async function testIntegration() {
  const result = await symptomAPI.analyzeSymptoms(
    "I have fever and cough with body ache",
    30,
    "Male"
  );
  
  const formatted = symptomAPI.formatResults(result);
  console.log('Formatted result:', formatted);
}

testIntegration();
*/
