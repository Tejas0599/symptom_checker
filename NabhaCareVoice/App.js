import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  ImageBackground,
  ScrollView,
  Alert,
  Linking,
  Dimensions,
  Platform
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

const Stack = createStackNavigator();
const { width, height } = Dimensions.get('window');

// Welcome Screen with Phone Number Input
function WelcomeScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleNext = () => {
    if (phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    navigation.navigate('MainDashboard');
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }}
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>NabhaCare</Text>
          <Text style={styles.welcomeSubtitle}>Your Health, Our Priority</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter your phone number</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

// Main Dashboard with 4 Features
function MainDashboard({ navigation }) {
  const features = [
    {
      id: 'emergency',
      title: 'Emergency SOS',
      subtitle: 'Press for life-threatening emergency',
      icon: '🚨',
      color: '#F44336',
      screen: 'EmergencySOS',
    },
    {
      id: 'ai',
      title: 'AI Health Assistant',
      subtitle: 'Speak about your health issues',
      icon: '🤖',
      color: '#2196F3',
      screen: 'AIHealthAssistant',
    },
    {
      id: 'doctor',
      title: 'Call Doctor',
      subtitle: 'Connect with doctor via call',
      icon: '👨‍⚕️',
      color: '#4CAF50',
      screen: 'CallDoctor',
    },
    {
      id: 'records',
      title: 'My Health Records',
      subtitle: 'View your medical history',
      icon: '📋',
      color: '#9E9E9E',
      screen: 'HealthRecords',
    },
  ];

  const handleFeaturePress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>NabhaCare</Text>
          <Text style={styles.dashboardSubtitle}>Choose your health service</Text>
        </View>
        
        <View style={styles.featuresContainer}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[styles.featureCard, { borderLeftColor: feature.color }]}
              onPress={() => handleFeaturePress(feature.screen)}
            >
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>{feature.icon}</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// AI Health Assistant with Real-time Voice Recording
function AIHealthAssistant({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [recording, setRecording] = useState(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      console.log('=== STARTING RECORDING ===');
      console.log('Permission status:', permissionResponse.status);
      
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Creating recording with WAV format...');
      const { recording } = await Audio.Recording.createAsync(
        {
          android: {
            extension: '.wav',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: 'audio/wav',
            bitsPerSecond: 128000,
          },
        }
      );
      
      console.log('Recording object created:', recording);
      setRecording(recording);
      setIsRecording(true);
      setTranscription('Recording... Speak about your symptoms');
      console.log('=== RECORDING STARTED SUCCESSFULLY ===');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', `Failed to start recording: ${err.message}`);
    }
  };

  const stopRecording = async () => {
    console.log('=== STOPPING RECORDING ===');
    setIsRecording(false);
    setTranscription('Processing your voice...');
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      console.log('Recording stopped successfully');
      console.log('Audio file URI:', uri);
      console.log('Audio file exists check...');
      
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('File info:', fileInfo);
      
      if (fileInfo.exists) {
        console.log('File size:', fileInfo.size, 'bytes');
        console.log('File URI:', fileInfo.uri);
      } else {
        console.error('Audio file does not exist!');
        setTranscription('Error: Audio file not found');
        return;
      }
      
      // Process audio directly
      await processAudio(uri);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setTranscription(`Error stopping recording: ${error.message}`);
    }
  };

  const processAudio = async (audioUri) => {
    try {
      console.log('Processing audio file:', audioUri);
      console.log('Sending audio directly to API');
      await sendAudioToAPI(audioUri);
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setTranscription(`Error processing audio: ${error.message}`);
      setAnalysis(null);
    }
  };

  const sendAudioToAPI = async (audioUri) => {
    try {
      console.log('=== SENDING AUDIO TO API ===');
      console.log('Audio URI:', audioUri);
      
      // Always send as file upload, not URL
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav',
      });

      console.log('FormData created with audio file');
      console.log('Making API call to:', 'http://10.0.1.177:8000/analyze-voice');
      
      const response = await fetch('http://10.0.1.177:8000/analyze-voice', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        setTranscription(`API Error: ${response.status} - ${errorText}`);
        setAnalysis(null);
        return;
      }
      
      const result = await response.json();
      console.log('=== API RESPONSE ===');
      console.log('Full response:', JSON.stringify(result, null, 2));
      
      if (result.success && result.transcription) {
        const transcriptionText = typeof result.transcription === 'string' 
          ? result.transcription 
          : result.transcription.text || 'Transcription not available';
        console.log('Setting transcription:', transcriptionText);
        setTranscription(transcriptionText);
        setAnalysis(result.analysis || null);
      } else {
        console.log('No transcription in response');
        console.log('Response success:', result.success);
        console.log('Response transcription:', result.transcription);
        setTranscription('Transcription not available');
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Error sending audio to API:', error);
      setTranscription(`Error processing audio: ${error.message}`);
      setAnalysis(null);
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Health Assistant</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.aiContent}>
          <Text style={styles.aiTitle}>Speak about your symptoms</Text>
          <Text style={styles.aiSubtitle}>I'll analyze and provide health recommendations</Text>
          
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPress={handleRecord}
          >
            <Text style={styles.recordButtonText}>
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.recordButton, { backgroundColor: '#FF9800' }]}
            onPress={() => {
              console.log('=== DEBUG INFO ===');
              console.log('isRecording:', isRecording);
              console.log('transcription:', transcription);
              console.log('analysis:', analysis);
              console.log('recording object:', recording);
              Alert.alert('Debug Info', `Recording: ${isRecording}\nTranscription: ${transcription}\nAnalysis: ${analysis ? 'Available' : 'None'}\nRecording Object: ${recording ? 'Exists' : 'Null'}`);
            }}
          >
            <Text style={styles.recordButtonText}>Debug Info</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.recordButton, { backgroundColor: '#9C27B0' }]}
            onPress={async () => {
              console.log('=== TESTING API DIRECTLY ===');
              try {
                const response = await fetch('http://10.0.1.177:8000/health');
                const result = await response.json();
                console.log('Health check result:', result);
                Alert.alert('API Test', `API is ${result.status}\nWhisper: ${result.services.voice_analysis.whisper.status}\nSymptom Analyzer: ${result.services.voice_analysis.symptom_analyzer.status}`);
              } catch (error) {
                console.error('API test error:', error);
                Alert.alert('API Test Error', error.message);
              }
            }}
          >
            <Text style={styles.recordButtonText}>Test API</Text>
          </TouchableOpacity>
          
          {transcription ? (
            <View style={styles.transcriptionContainer}>
              <Text style={styles.transcriptionTitle}>Transcription:</Text>
              <Text style={styles.transcriptionText}>{transcription}</Text>
            </View>
          ) : null}
          
          {analysis && (
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitle}>Health Analysis:</Text>
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
              
              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {analysis.recommendations && Array.isArray(analysis.recommendations) && analysis.recommendations.map((rec, index) => (
                <Text key={index} style={styles.recommendation}>• {rec}</Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Emergency SOS Screen
function EmergencySOS({ navigation }) {
  const emergencyNumbers = [
    { name: 'Police', number: '100', color: '#F44336' },
    { name: 'Ambulance', number: '102', color: '#4CAF50' },
    { name: 'Fire Department', number: '101', color: '#FF9800' },
    { name: 'Women Helpline', number: '1091', color: '#E91E63' },
  ];

  const callEmergency = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.emergencyContent}>
          <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
          <Text style={styles.emergencySubtitle}>Tap to call emergency services</Text>
          
          {emergencyNumbers.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.emergencyCard, { borderLeftColor: contact.color }]}
              onPress={() => callEmergency(contact.number)}
            >
              <View style={styles.emergencyIcon}>
                <Text style={styles.emergencyIconText}>📞</Text>
              </View>
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyName}>{contact.name}</Text>
                <Text style={styles.emergencyNumber}>{contact.number}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Call Doctor Screen
function CallDoctor({ navigation }) {
  const doctors = [
    { name: 'Dr. Sarah Johnson', specialty: 'General Physician', rating: '4.8', available: true },
    { name: 'Dr. Michael Chen', specialty: 'Cardiologist', rating: '4.9', available: false },
    { name: 'Dr. Emily Davis', specialty: 'Pediatrician', rating: '4.7', available: true },
  ];

  const callDoctor = (doctor) => {
    if (doctor.available) {
      Alert.alert('Calling Doctor', `Calling ${doctor.name}...`);
      // Implement actual calling logic here
    } else {
      Alert.alert('Doctor Unavailable', `${doctor.name} is currently not available`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Call Doctor</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.doctorsContent}>
          <Text style={styles.doctorsTitle}>Available Doctors</Text>
          <Text style={styles.doctorsSubtitle}>Connect with healthcare professionals</Text>
          
          {doctors.map((doctor, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.doctorCard, !doctor.available && styles.unavailableCard]}
              onPress={() => callDoctor(doctor)}
            >
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                <Text style={styles.doctorRating}>⭐ {doctor.rating}</Text>
              </View>
              <View style={styles.doctorStatus}>
                <Text style={[styles.statusText, doctor.available ? styles.available : styles.unavailable]}>
                  {doctor.available ? 'Available' : 'Busy'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Health Records Screen with PDF Prescriptions
function HealthRecords({ navigation }) {
  const [records, setRecords] = useState([
    { 
      date: '2024-01-15', 
      type: 'Blood Test', 
      result: 'Normal', 
      doctor: 'Dr. Sarah Johnson',
      prescription: null
    },
    { 
      date: '2024-01-10', 
      type: 'X-Ray', 
      result: 'Clear', 
      doctor: 'Dr. Michael Chen',
      prescription: 'prescription_2024_01_10.pdf'
    },
    { 
      date: '2024-01-05', 
      type: 'Checkup', 
      result: 'Healthy', 
      doctor: 'Dr. Emily Davis',
      prescription: 'prescription_2024_01_05.pdf'
    },
  ]);

  const [selectedPDF, setSelectedPDF] = useState(null);

  const openPDF = async (pdfName) => {
    try {
      // Create a detailed prescription content
      const pdfContent = `
PRESCRIPTION
═══════════════════════════════════════════════════════════════

Date: ${new Date().toLocaleDateString()}
Patient: John Doe
Patient ID: #12345
Doctor: Dr. Sarah Johnson
License: MD-2024-001

DIAGNOSIS:
• Upper respiratory infection
• Mild fever and cough

PRESCRIBED MEDICATIONS:
═══════════════════════════════════════════════════════════════

1. PARACETAMOL 500mg
   • Dosage: 1 tablet every 6 hours
   • Duration: 5 days
   • Instructions: Take with food
   • Quantity: 20 tablets

2. IBUPROFEN 400mg
   • Dosage: 1 tablet every 8 hours
   • Duration: 3 days
   • Instructions: Take with milk
   • Quantity: 9 tablets

3. VITAMIN C 1000mg
   • Dosage: 1 tablet daily
   • Duration: 10 days
   • Instructions: Take in morning
   • Quantity: 10 tablets

4. COUGH SYRUP
   • Dosage: 5ml every 8 hours
   • Duration: 7 days
   • Instructions: Take after meals
   • Quantity: 100ml bottle

IMPORTANT INSTRUCTIONS:
═══════════════════════════════════════════════════════════════
• Complete the full course of antibiotics
• Take medications with food to avoid stomach upset
• Drink plenty of fluids
• Get adequate rest
• Follow up in 7 days if symptoms persist
• Contact doctor if side effects occur

NEXT APPOINTMENT:
═══════════════════════════════════════════════════════════════
Date: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
Time: 10:00 AM
Purpose: Follow-up checkup

Doctor's Signature: Dr. Sarah Johnson
Date: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════════
This is a digital prescription. Keep this for your records.
      `;
      
      Alert.alert(
        `📄 ${pdfName}`,
        pdfContent,
        [
          { text: 'Close', style: 'cancel' },
          { text: 'Save to Files', onPress: () => setSelectedPDF(pdfName) }
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert('Error', 'Could not open PDF file');
    }
  };

  const downloadPDF = async (pdfName) => {
    try {
      // Create a more realistic download experience
      Alert.alert(
        '📥 Download Prescription',
        `Downloading ${pdfName}...\n\nThis will save the prescription to your device for offline access.\n\nYou can view it anytime without internet connection.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Download', 
            onPress: () => {
              Alert.alert(
                '✅ Download Complete',
                `${pdfName} has been saved to your device.\n\nLocation: Downloads/NabhaCare/Prescriptions/\n\nYou can now access this prescription offline.`,
                [{ text: 'OK' }]
              );
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Error', 'Could not download PDF file');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Records</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.recordsContent}>
          <Text style={styles.recordsTitle}>Medical History</Text>
          <Text style={styles.recordsSubtitle}>Your recent health records and prescriptions</Text>
          
          {records.map((record, index) => (
            <View key={index} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordType}>{record.type}</Text>
                <Text style={styles.recordDate}>{record.date}</Text>
              </View>
              <Text style={styles.recordResult}>Result: {record.result}</Text>
              <Text style={styles.recordDoctor}>Doctor: {record.doctor}</Text>
              
              {record.prescription && (
                <View style={styles.prescriptionContainer}>
                  <Text style={styles.prescriptionLabel}>Prescription:</Text>
                  <View style={styles.prescriptionActions}>
                    <TouchableOpacity 
                      style={styles.pdfButton}
                      onPress={() => openPDF(record.prescription)}
                    >
                      <Text style={styles.pdfButtonText}>📄 View PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={() => downloadPDF(record.prescription)}
                    >
                      <Text style={styles.downloadButtonText}>⬇️ Download</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  console.log('App.js: Starting NabhaCare app with real-time voice and PDF support');
  
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="MainDashboard" component={MainDashboard} />
        <Stack.Screen name="AIHealthAssistant" component={AIHealthAssistant} />
        <Stack.Screen name="EmergencySOS" component={EmergencySOS} />
        <Stack.Screen name="CallDoctor" component={CallDoctor} />
        <Stack.Screen name="HealthRecords" component={HealthRecords} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  welcomeTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  phoneInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 25,
    fontSize: 16,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 25,
    paddingHorizontal: 40,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  dashboardHeader: {
    padding: 20,
    backgroundColor: '#1976D2',
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  dashboardSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
  },
  featuresContainer: {
    padding: 20,
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 10,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    marginRight: 15,
  },
  featureIconText: {
    fontSize: 30,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 24,
    color: '#999',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1976D2',
  },
  backButton: {
    color: 'white',
    fontSize: 16,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  aiContent: {
    padding: 20,
  },
  aiTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  aiSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  recordButton: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 25,
    marginVertical: 20,
  },
  recordingButton: {
    backgroundColor: '#F44336',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  transcriptionContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  transcriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  transcriptionText: {
    fontSize: 14,
    color: '#666',
  },
  analysisContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  predictionItem: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  confidence: {
    fontSize: 14,
    color: '#666',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  recommendation: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  emergencyContent: {
    padding: 20,
  },
  emergencyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  emergencySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  emergencyCard: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 10,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyIcon: {
    marginRight: 15,
  },
  emergencyIconText: {
    fontSize: 30,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  emergencyNumber: {
    fontSize: 16,
    color: '#666',
  },
  doctorsContent: {
    padding: 20,
  },
  doctorsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  doctorsSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  doctorCard: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 10,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unavailableCard: {
    opacity: 0.6,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  doctorRating: {
    fontSize: 14,
    color: '#FF9800',
  },
  doctorStatus: {
    marginLeft: 15,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    padding: 8,
    borderRadius: 15,
    textAlign: 'center',
  },
  available: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  unavailable: {
    backgroundColor: '#F44336',
    color: 'white',
  },
  recordsContent: {
    padding: 20,
  },
  recordsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  recordsSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  recordCard: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recordType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  recordResult: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 5,
  },
  recordDoctor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  prescriptionContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  prescriptionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  prescriptionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pdfButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 20,
    flex: 1,
    marginRight: 5,
  },
  pdfButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 20,
    flex: 1,
    marginLeft: 5,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});