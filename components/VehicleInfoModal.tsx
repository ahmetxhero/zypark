import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Car, Plus, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  type: 'car' | 'motorcycle' | 'truck' | 'suv';
}

interface VehicleInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function VehicleInfoModal({ visible, onClose }: VehicleInfoModalProps) {
  const { profile, updateProfile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>(
    profile?.vehicle_info?.vehicles || []
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    type: 'car'
  });

  const vehicleTypes = [
    { value: 'car', label: 'Car' },
    { value: 'suv', label: 'SUV' },
    { value: 'truck', label: 'Truck' },
    { value: 'motorcycle', label: 'Motorcycle' }
  ];

  const handleAddVehicle = async () => {
    if (!newVehicle.make || !newVehicle.model || !newVehicle.licensePlate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const vehicle: Vehicle = {
      id: Date.now().toString(),
      make: newVehicle.make!,
      model: newVehicle.model!,
      year: newVehicle.year || '',
      color: newVehicle.color || '',
      licensePlate: newVehicle.licensePlate!,
      type: newVehicle.type as Vehicle['type'] || 'car'
    };

    const updatedVehicles = [...vehicles, vehicle];
    setVehicles(updatedVehicles);

    try {
      await updateProfile({
        vehicle_info: { vehicles: updatedVehicles }
      });
      setShowAddForm(false);
      setNewVehicle({
        make: '',
        model: '',
        year: '',
        color: '',
        licensePlate: '',
        type: 'car'
      });
      Alert.alert('Success', 'Vehicle added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add vehicle');
    }
  };

  const handleRemoveVehicle = async (vehicleId: string) => {
    const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
    setVehicles(updatedVehicles);

    try {
      await updateProfile({
        vehicle_info: { vehicles: updatedVehicles }
      });
      Alert.alert('Success', 'Vehicle removed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove vehicle');
    }
  };

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Vehicle Information</Text>
        <TouchableOpacity onPress={() => setShowAddForm(true)}>
          <Plus color="#2563EB" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {vehicles.length === 0 ? (
          <Animated.View entering={FadeInUp} style={styles.emptyState}>
            <Car color="#6B7280" size={48} />
            <Text style={styles.emptyTitle}>No vehicles added</Text>
            <Text style={styles.emptyText}>
              Add your vehicle information to make parking reservations easier
            </Text>
          </Animated.View>
        ) : (
          vehicles.map((vehicle, index) => (
            <Animated.View 
              key={vehicle.id}
              entering={FadeInUp.delay(index * 100)}
              style={styles.vehicleCard}
            >
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </Text>
                <Text style={styles.vehicleDetails}>
                  {vehicle.color} • {vehicle.licensePlate} • {vehicle.type.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveVehicle(vehicle.id)}
              >
                <X color="#DC2626" size={20} />
              </TouchableOpacity>
            </Animated.View>
          ))
        )}

        {showAddForm && (
          <Animated.View entering={FadeInUp} style={styles.addForm}>
            <Text style={styles.formTitle}>Add New Vehicle</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Make *</Text>
              <TextInput
                style={styles.input}
                value={newVehicle.make}
                onChangeText={(text) => setNewVehicle({...newVehicle, make: text})}
                placeholder="e.g., Toyota, BMW, Ford"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Model *</Text>
              <TextInput
                style={styles.input}
                value={newVehicle.model}
                onChangeText={(text) => setNewVehicle({...newVehicle, model: text})}
                placeholder="e.g., Camry, X5, Mustang"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Year</Text>
                <TextInput
                  style={styles.input}
                  value={newVehicle.year}
                  onChangeText={(text) => setNewVehicle({...newVehicle, year: text})}
                  placeholder="2020"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Color</Text>
                <TextInput
                  style={styles.input}
                  value={newVehicle.color}
                  onChangeText={(text) => setNewVehicle({...newVehicle, color: text})}
                  placeholder="Black"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>License Plate *</Text>
              <TextInput
                style={styles.input}
                value={newVehicle.licensePlate}
                onChangeText={(text) => setNewVehicle({...newVehicle, licensePlate: text.toUpperCase()})}
                placeholder="ABC-1234"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Type</Text>
              <View style={styles.typeSelector}>
                {vehicleTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      newVehicle.type === type.value && styles.typeButtonActive
                    ]}
                    onPress={() => setNewVehicle({...newVehicle, type: type.value as Vehicle['type']})}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      newVehicle.type === type.value && styles.typeButtonTextActive
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelFormButton}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={styles.cancelFormText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddVehicle}
              >
                <Text style={styles.addButtonText}>Add Vehicle</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 250,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  removeButton: {
    padding: 8,
  },
  addForm: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  typeButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  typeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelFormButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelFormText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});