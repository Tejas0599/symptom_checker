import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';

export default function HealthRecords({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Recent', 'Prescriptions', 'Labs', 'Vaccines'];

  const healthRecords = [
    {
      id: 1,
      title: 'Diabetes Medication',
      doctor: 'Dr. Rajesh Sharma',
      date: '2024-01-15',
      status: 'Active',
      statusColor: '#2196F3',
      icon: '💊',
      type: 'Prescriptions',
    },
    {
      id: 2,
      title: 'Blood Sugar Test',
      doctor: 'Dr. Priya Singh',
      date: '2024-01-10',
      status: 'Normal',
      statusColor: '#4CAF50',
      icon: '🧪',
      type: 'Labs',
    },
    {
      id: 3,
      title: 'COVID-19 Booster',
      doctor: 'Dr. Amit Kumar',
      date: '2024-01-05',
      status: 'Completed',
      statusColor: '#9C27B0',
      icon: '🛡️',
      type: 'Vaccines',
    },
    {
      id: 4,
      title: 'Blood Pressure Check',
      doctor: 'Dr. Rajesh Sharma',
      date: '2023-12-20',
      status: 'Normal',
      statusColor: '#4CAF50',
      icon: '🩸',
      type: 'Labs',
    },
    {
      id: 5,
      title: 'Cholesterol Medication',
      doctor: 'Dr. Priya Singh',
      date: '2023-12-15',
      status: 'Active',
      statusColor: '#2196F3',
      icon: '💊',
      type: 'Prescriptions',
    },
  ];

  const filteredRecords = healthRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || record.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleRecordPress = (record) => {
    // Navigate to record details
    console.log('Record pressed:', record.title);
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
        <Text style={styles.headerTitle}>Health Records</Text>
      </View>

      {/* Sub Header */}
      <View style={styles.subHeader}>
        <TouchableOpacity 
          style={styles.subBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.subBackIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>My Health Records</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search records..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.activeFilterTab
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.activeFilterText
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Records List */}
      <ScrollView style={styles.recordsContainer}>
        {filteredRecords.map((record) => (
          <TouchableOpacity
            key={record.id}
            style={styles.recordCard}
            onPress={() => handleRecordPress(record)}
            activeOpacity={0.7}
          >
            <View style={styles.recordContent}>
              <View style={[styles.recordIcon, { backgroundColor: record.statusColor }]}>
                <Text style={styles.recordIconText}>{record.icon}</Text>
              </View>
              
              <View style={styles.recordInfo}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.recordDoctor}>{record.doctor}</Text>
                <Text style={styles.recordDate}>{record.date}</Text>
              </View>
              
              <View style={styles.recordStatus}>
                <View style={[styles.statusBadge, { backgroundColor: record.statusColor }]}>
                  <Text style={styles.statusText}>{record.status}</Text>
                </View>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
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
    backgroundColor: '#1976D2',
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
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  subBackButton: {
    marginRight: 15,
  },
  subBackIcon: {
    fontSize: 20,
    color: '#666',
  },
  subHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterContent: {
    paddingHorizontal: 20,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  activeFilterTab: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  recordsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  recordIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  recordIconText: {
    fontSize: 20,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recordDoctor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 12,
    color: '#999',
  },
  recordStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrowIcon: {
    fontSize: 16,
    color: '#666',
  },
});
