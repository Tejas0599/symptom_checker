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

export default function EmergencySOS({ navigation }) {
  const emergencyNumbers = [
    {
      name: 'Police',
      number: '100',
      color: '#2196F3',
      icon: '👮‍♂️',
    },
    {
      name: 'Ambulance',
      number: '108',
      color: '#F44336',
      icon: '🚑',
    },
    {
      name: 'Fire',
      number: '101',
      color: '#FF9800',
      icon: '🚒',
    },
    {
      name: 'Women Helpline',
      number: '1091',
      color: '#9C27B0',
      icon: '👩',
    },
  ];

  const handleSOSPress = () => {
    Alert.alert(
      'Emergency SOS',
      'Are you sure you want to call emergency services?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Linking.openURL('tel:108') },
      ]
    );
  };

  const handleNumberPress = (number) => {
    Linking.openURL(`tel:${number}`);
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
        <Text style={styles.headerTitle}>Emergency SOS</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Main SOS Button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity 
            style={styles.sosButton}
            onPress={handleSOSPress}
            activeOpacity={0.8}
          >
            <Text style={styles.sosIcon}>🚨</Text>
            <Text style={styles.sosText}>Emergency SOS</Text>
            <Text style={styles.sosSubtext}>Press for life-threatening emergencies</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Numbers */}
        <View style={styles.numbersContainer}>
          <Text style={styles.numbersTitle}>Emergency Numbers</Text>
          
          {emergencyNumbers.map((emergency, index) => (
            <TouchableOpacity
              key={index}
              style={styles.numberCard}
              onPress={() => handleNumberPress(emergency.number)}
              activeOpacity={0.7}
            >
              <View style={[styles.numberAccent, { backgroundColor: emergency.color }]} />
              <View style={styles.numberContent}>
                <Text style={styles.numberIcon}>{emergency.icon}</Text>
                <View style={styles.numberTextContainer}>
                  <Text style={styles.numberName}>{emergency.name}</Text>
                  <Text style={styles.numberValue}>{emergency.number}</Text>
                </View>
                <Text style={styles.callIcon}>📞</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F44336',
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
  sosContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F44336',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  sosIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  sosText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  sosSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  numbersContainer: {
    padding: 20,
  },
  numbersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  numberCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  numberAccent: {
    width: 4,
    height: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  numberContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  numberIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  numberTextContainer: {
    flex: 1,
  },
  numberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  numberValue: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  callIcon: {
    fontSize: 20,
    color: '#4CAF50',
  },
});
