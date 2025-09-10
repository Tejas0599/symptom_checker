import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';

export default function CallDoctor({ navigation }) {
  const doctors = [
    {
      id: 1,
      name: 'Dr. Rajesh Sharma',
      specialization: 'General Medicine',
      rating: 4.8,
      experience: '15+ years',
      fee: '₹200',
      availability: 'Available Now',
      languages: ['English', 'Hindi', 'Punjabi'],
      avatar: 'RS',
    },
    {
      id: 2,
      name: 'Dr. Priya Singh',
      specialization: 'Cardiology',
      rating: 4.9,
      experience: '12+ years',
      fee: '₹500',
      availability: 'Available Now',
      languages: ['English', 'Hindi'],
      avatar: 'PS',
    },
    {
      id: 3,
      name: 'Dr. Amit Kumar',
      specialization: 'Pediatrics',
      rating: 4.7,
      experience: '10+ years',
      fee: '₹300',
      availability: 'Available Now',
      languages: ['English', 'Hindi', 'Punjabi'],
      avatar: 'AK',
    },
  ];

  const handleCall = (doctor) => {
    Alert.alert(
      'Call Doctor',
      `Call ${doctor.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL('tel:+919876543210') },
      ]
    );
  };

  const handleVideoCall = () => {
    Alert.alert('Coming Soon', 'Video call feature will be available soon!');
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
        <Text style={styles.headerTitle}>Call a Doctor</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Availability Banner */}
        <View style={styles.availabilityBanner}>
          <Text style={styles.checkIcon}>✅</Text>
          <Text style={styles.availabilityText}>Dr. Sharma is available now</Text>
        </View>

        {/* Doctor Cards */}
        {doctors.map((doctor) => (
          <View key={doctor.id} style={styles.doctorCard}>
            <View style={styles.doctorHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{doctor.avatar}</Text>
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.specialization}>{doctor.specialization}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.rating}>⭐ {doctor.rating}</Text>
                  <Text style={styles.experience}>({doctor.experience})</Text>
                </View>
              </View>
            </View>

            <View style={styles.doctorDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Experience:</Text>
                <Text style={styles.detailValue}>{doctor.experience}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Consultation Fee:</Text>
                <Text style={styles.detailValue}>{doctor.fee}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Availability:</Text>
                <View style={styles.availabilityBadge}>
                  <Text style={styles.clockIcon}>🕐</Text>
                  <Text style={styles.availabilityBadgeText}>{doctor.availability}</Text>
                </View>
              </View>
            </View>

            <View style={styles.languagesContainer}>
              <Text style={styles.languagesTitle}>Languages Spoken:</Text>
              <View style={styles.languageTags}>
                {doctor.languages.map((language, index) => (
                  <View key={index} style={styles.languageTag}>
                    <Text style={styles.languageText}>{language}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.callButton}
                onPress={() => handleCall(doctor)}
              >
                <Text style={styles.callIcon}>📞</Text>
                <Text style={styles.callButtonText}>Start Voice Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.videoButton}
                onPress={handleVideoCall}
              >
                <Text style={styles.videoIcon}>📹</Text>
                <Text style={styles.videoButtonText}>Video Call (Coming Soon)</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    backgroundColor: '#4CAF50',
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
  availabilityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  checkIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  availabilityText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  doctorCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 5,
  },
  specialization: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#FF9800',
    marginRight: 10,
  },
  experience: {
    fontSize: 14,
    color: '#666',
  },
  doctorDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  clockIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  availabilityBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  languagesContainer: {
    marginBottom: 20,
  },
  languagesTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  languageTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 10,
  },
  callIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  callButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  videoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  videoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  videoButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});
