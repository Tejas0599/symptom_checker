#!/usr/bin/env node

/**
 * Test script for symptom checker integration
 * Run with: node test_integration.js
 */

const SymptomCheckerAPI = require('./symptom_api_wrapper.js');
const VoiceSymptomAnalyzer = require('./voice_integration_example.js');

async function runTests() {
  console.log('🧪 Testing Symptom Checker Integration\n');
  
  // Test 1: Basic API wrapper
  console.log('1️⃣ Testing basic API wrapper...');
  const api = new SymptomCheckerAPI('http://localhost:8000');
  
  try {
    const health = await api.healthCheck();
    console.log(`   Health check: ${health ? '✅ Healthy' : '❌ Unhealthy'}`);
    
    const result = await api.analyzeSymptoms('I have fever and cough', 25, 'Female');
    console.log(`   Analysis: ${result.success ? '✅ Success' : '❌ Failed'}`);
    
    if (result.success) {
      const formatted = api.formatResults(result);
      console.log(`   Top prediction: ${formatted.topPrediction} (${formatted.confidence}%)`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 2: Voice integration
  console.log('\n2️⃣ Testing voice integration...');
  const voiceAnalyzer = new VoiceSymptomAnalyzer('http://localhost:8000');
  
  try {
    const voiceResult = await voiceAnalyzer.processVoiceToSymptoms(
      Buffer.from('mock audio data'),
      { age: 35, gender: 'Male' }
    );
    
    console.log(`   Voice analysis: ${voiceResult.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   Transcription: ${voiceResult.transcription}`);
    
    if (voiceResult.success) {
      console.log(`   Top prediction: ${voiceResult.analysis.topPrediction} (${voiceResult.analysis.confidence}%)`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 3: Health status
  console.log('\n3️⃣ Testing health status...');
  try {
    const healthStatus = await voiceAnalyzer.getHealthStatus();
    console.log(`   Overall health: ${healthStatus.overall ? '✅ All systems healthy' : '❌ Some systems down'}`);
    console.log(`   Symptom checker: ${healthStatus.symptomChecker ? '✅' : '❌'}`);
    console.log(`   Whisper: ${healthStatus.whisper ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 4: Different symptom inputs
  console.log('\n4️⃣ Testing different symptom inputs...');
  const testCases = [
    { symptoms: 'I have severe chest pain', age: 45, gender: 'Male' },
    { symptoms: 'I have headache and nausea', age: 28, gender: 'Female' },
    { symptoms: 'I have joint pain and swelling', age: 60, gender: 'Male' }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    try {
      const result = await api.analyzeSymptoms(testCase.symptoms, testCase.age, testCase.gender);
      if (result.success) {
        const formatted = api.formatResults(result);
        console.log(`   Test ${i + 1}: ${formatted.topPrediction} (${formatted.confidence}%)`);
      } else {
        console.log(`   Test ${i + 1}: ❌ Failed`);
      }
    } catch (error) {
      console.log(`   Test ${i + 1}: ❌ Error`);
    }
  }
  
  console.log('\n🎉 Integration tests completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Share your repository with the Nabhacare team');
  console.log('   2. They can copy these integration files to their backend');
  console.log('   3. Follow the instructions in integration/README.md');
  console.log('   4. Test with real voice input from their Whisper system');
}

// Run tests
runTests().catch(console.error);
