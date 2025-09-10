import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zimxtafutycqjidojpqc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppbXh0YWZ1dHljcWppZG9qcHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MDQ4NzQsImV4cCI6MjA1MTk4MDg3NH0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';
const supabase = createClient(supabaseUrl, supabaseKey);

const API_BASE_URL = 'http://10.0.1.177:8000';

export default function AIHealthAssistant({ navigation }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone permission');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      setRecording(null);
      
      // Upload to Supabase and send to API
      await uploadToSupabase(uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const uploadToSupabase = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `voice_recording_${Date.now()}.m4a`;
      
      const { data, error } = await supabase.storage
        .from('voice-recordings')
        .upload(fileName, blob, {
          contentType: 'audio/m4a',
        });

      if (error) {
        console.warn('Supabase upload failed (will continue without storage):', error.message);
        return { path: fileName, fullPath: `voice-recordings/${fileName}` };
      }
      console.log('Uploaded to Supabase:', data);
      return data;
    } catch (error) {
      console.warn('Failed to upload to Supabase (will continue without storage):', error.message);
      return { path: `voice_recording_${Date.now()}.m4a`, fullPath: `voice-recordings/voice_recording_${Date.now()}.m4a` };
    }
  };

  const sendAudioToAPI = async (uri) => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('audio', {
        uri: uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      });

      const response = await fetch(`${API_BASE_URL}/analyze-voice`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', JSON.stringify(result, null, 2));
      
      if (result.success && result.transcription) {
        // Handle both object and string transcription formats
        const transcriptionText = typeof result.transcription === 'string' 
          ? result.transcription 
          : result.transcription.text || 'Transcription not available';
        setTranscription(transcriptionText);
        setAnalysis(result.analysis || null);
      } else {
        setTranscription('Transcription not available');
        setAnalysis(null);
      }
      
    } catch (error) {
      console.error('Error processing recording:', error);
      setTranscription('Error processing audio. Please try again.');
      Alert.alert('Error', 'Failed to process voice recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetApp = () => {
    setTranscription('');
    setAnalysis(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Health Assistant</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Main Recording Section */}
        <View style={styles.recordingSection}>
          <Text style={styles.title}>Speak about your health problems</Text>
          <Text style={styles.subtitle}>Tap and hold to record your symptoms</Text>
          
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={isProcessing}
          >
            <Text style={styles.recordIcon}>
              {isRecording ? '🔴' : '🎤'}
            </Text>
            <Text style={styles.recordText}>
              {isRecording ? 'Recording...' : 'Hold to Record'}
            </Text>
          </TouchableOpacity>

          {isProcessing && (
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>Processing your voice...</Text>
            </View>
          )}
        </View>

        {/* Transcription Section */}
        {transcription && (
          <View style={styles.transcriptionSection}>
            <Text style={styles.sectionTitle}>Transcription</Text>
            <Text style={styles.transcriptionText}>{transcription}</Text>
          </View>
        )}

        {/* Analysis Section */}
        {analysis && (
          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>Disease Predictions</Text>
            {analysis.predictions && Array.isArray(analysis.predictions) && analysis.predictions.map((pred, index) => (
              <View key={index} style={styles.predictionItem}>
                <Text style={styles.diseaseName}>
                  {pred.disease || pred.text || 'Unknown Disease'}
                </Text>
                <Text style={styles.confidence}>
                  {pred.confidence ? `${pred.confidence.toFixed(1)}% confidence` : ''}
                </Text>
              </View>
            ))}

            {analysis.top_prediction && (
              <View style={styles.topPrediction}>
                <Text style={styles.sectionTitle}>Top Prediction</Text>
                <Text style={styles.topPredictionText}>
                  {analysis.top_prediction} ({analysis.confidence?.toFixed(1)}% confidence)
                </Text>
              </View>
            )}

            {analysis.next_step && (
              <View style={styles.nextStep}>
                <Text style={styles.sectionTitle}>Next Step</Text>
                <Text style={styles.nextStepText}>
                  {analysis.next_step}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Reset Button */}
        {(transcription || analysis) && (
          <View style={styles.resetSection}>
            <TouchableOpacity style={styles.resetButton} onPress={resetApp}>
              <Text style={styles.resetButtonText}>Record Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2196F3',
  },
  backButton: {
    marginRight: 15,
  },
  backIcon: {
    fontSize: 24,
    color: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  recordingSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  recordButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  recordingButton: {
    backgroundColor: '#F44336',
  },
  recordIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  recordText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  processingContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
  },
  processingText: {
    color: '#1976D2',
    fontSize: 16,
    textAlign: 'center',
  },
  transcriptionSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  analysisSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  predictionItem: {
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 10,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  confidence: {
    fontSize: 14,
    color: '#666',
  },
  topPrediction: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#E8F5E8',
    borderRadius: 5,
  },
  topPredictionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  nextStep: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 5,
  },
  nextStepText: {
    fontSize: 14,
    color: '#F57C00',
    fontWeight: 'bold',
  },
  resetSection: {
    margin: 20,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#9E9E9E',
    padding: 15,
    borderRadius: 25,
    paddingHorizontal: 30,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
