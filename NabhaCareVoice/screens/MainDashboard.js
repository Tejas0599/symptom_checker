import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

export default function MainDashboard({ navigation }) {
  console.log('MainDashboard: Rendering main dashboard');
  const features = [
    {
      id: 'emergency',
      title: 'ਐਮਰਜੈਂਸੀ SOS',
      subtitle: 'ਜੀਵਨ-ਖਤਰਨਾਕ ਐਮਰਜੈਂਸੀ ਲਈ ਦਬਾਓ',
      icon: '🚨',
      color: '#F44336',
      screen: 'EmergencySOS',
    },
    {
      id: 'ai',
      title: 'ਏਆਈ ਸਿਹਤ ਸਹਾਇਕ',
      subtitle: 'ਆਪਣੀਆਂ ਸਿਹਤ ਸਮੱਸਿਆਵਾਂ ਬਾਰੇ ਬੋਲੋ',
      icon: '🤖',
      color: '#2196F3',
      screen: 'AIHealthAssistant',
    },
    {
      id: 'doctor',
      title: 'ਡਾਕਟਰ ਨੂੰ ਕਾਲ ਕਰੋ',
      subtitle: 'ਕਾਲ ਰਾਹੀਂ ਡਾਕਟਰ ਨਾਲ ਜੁੜੋ',
      icon: '👨‍⚕️',
      color: '#4CAF50',
      screen: 'CallDoctor',
    },
    {
      id: 'records',
      title: 'ਮੇਰੇ ਸਿਹਤ ਰਿਕਾਰਡ',
      subtitle: 'ਆਪਣਾ ਮੈਡੀਕਲ ਇਤਿਹਾਸ ਵੇਖੋ',
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>ਨਾਭਾਕੇਅਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ</Text>
          <Text style={styles.subtitle}>ਸਿਹਤ ਸੇਵਾਵਾਂ</Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[styles.featureCard, { backgroundColor: feature.color }]}
              onPress={() => handleFeaturePress(feature.screen)}
              activeOpacity={0.8}
            >
              <View style={styles.featureContent}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                </View>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('AIHealthAssistant')}
        >
          <Text style={styles.navIcon}>🎤</Text>
          <Text style={styles.navText}>Voice</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('CallDoctor')}
        >
          <Text style={styles.navIcon}>📞</Text>
          <Text style={styles.navText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('EmergencySOS')}
        >
          <Text style={styles.navIcon}>❤️</Text>
          <Text style={styles.navText}>SOS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'white',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#2196F3',
    textAlign: 'center',
  },
  featuresContainer: {
    padding: 20,
  },
  featureCard: {
    borderRadius: 15,
    marginBottom: 15,
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
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  featureSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  arrowIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  navText: {
    fontSize: 12,
    color: '#666',
  },
});
