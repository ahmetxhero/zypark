import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Filter, Menu, MapPin, Star, Navigation } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import GoogleMapsView from '@/components/GoogleMapsView';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

export default function MapScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loadingSpots, setLoadingSpots] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/welcome');
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      loadParkingSpots();
      getUserLocation();
    }
  }, [user]);

  const loadParkingSpots = async () => {
    try {
      setLoadingSpots(true);
      const { data, error } = await supabase
        .from('parking_spots')
        .select(`
          *,
          categories (
            name,
            icon
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setParkingSpots(data || []);
    } catch (error: any) {
      console.error('Error loading parking spots:', error);
    } finally {
      setLoadingSpots(false);
    }
  };

  const getUserLocation = () => {
    // Simulated user location for demo
    setUserLocation({
      latitude: 37.7749,
      longitude: -122.4194
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return null;
  }

  const availableSpots = parkingSpots.filter((spot: any) => spot.is_available);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInUp} style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton}>
            <Menu color="#1F2937" size={24} />
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.location}>San Francisco, CA</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.filterButton}>
            <Filter color="#1F2937" size={20} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewToggle, showMap && styles.viewToggleActive]}
            onPress={() => setShowMap(!showMap)}
          >
            <Text style={[styles.viewToggleText, showMap && styles.viewToggleTextActive]}>
              {showMap ? 'Map' : 'List'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {showMap ? (
        <GoogleMapsView
          parkingSpots={parkingSpots}
          userLocation={userLocation}
          onMarkerPress={(spot) => console.log('Selected spot:', spot)}
          style={styles.mapContainer}
        />
      ) : (
        <View style={styles.listContainer}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.statsBar}>
            <View style={styles.statItem}>
              <Navigation color="#2563EB" size={16} />
              <Text style={styles.statText}>{availableSpots.length} spots nearby</Text>
            </View>
            <Text style={styles.distanceText}>Within 2 miles</Text>
          </Animated.View>

          {loadingSpots ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading parking spots...</Text>
            </View>
          ) : (
            <ScrollView style={styles.spotsList} showsVerticalScrollIndicator={false}>
              {parkingSpots.slice(0, 8).map((spot: any, index) => (
                <Animated.View 
                  key={spot.id} 
                  entering={FadeInUp.delay(300 + index * 100)}
                >
                  <TouchableOpacity style={styles.spotCard}>
                    <Image
                      source={{ uri: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=400' }}
                      style={styles.spotImage}
                    />
                    <View style={styles.spotInfo}>
                      <View style={styles.spotHeader}>
                        <Text style={styles.spotTitle}>{spot.title}</Text>
                        <View style={[
                          styles.availableIndicator,
                          { backgroundColor: spot.is_available ? '#059669' : '#DC2626' }
                        ]} />
                      </View>
                      <View style={styles.spotDetails}>
                        <MapPin color="#6B7280" size={14} />
                        <Text style={styles.spotAddress}>{spot.address}</Text>
                      </View>
                      <View style={styles.spotMeta}>
                        <Text style={styles.spotPrice}>${spot.price_per_hour}/hour</Text>
                        <View style={styles.ratingContainer}>
                          <Star color="#F59E0B" size={12} fill="#F59E0B" />
                          <Text style={styles.rating}>4.5</Text>
                        </View>
                      </View>
                      <View style={styles.amenitiesContainer}>
                        {spot.amenities?.ev_charging && (
                          <View style={styles.amenityTag}>
                            <Text style={styles.amenityText}>EV Charging</Text>
                          </View>
                        )}
                        {spot.amenities?.covered && (
                          <View style={styles.amenityTag}>
                            <Text style={styles.amenityText}>Covered</Text>
                          </View>
                        )}
                        {spot.amenities?.security_cameras && (
                          <View style={styles.amenityTag}>
                            <Text style={styles.amenityText}>Secure</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <Animated.View entering={FadeInUp.delay(600)}>
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#ffffff" size={24} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    padding: 8,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  location: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  viewToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  viewToggleActive: {
    backgroundColor: '#2563EB',
  },
  viewToggleText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  viewToggleTextActive: {
    color: '#ffffff',
  },
  mapContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  distanceText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  spotsList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  spotCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  spotImage: {
    width: 100,
    height: 120,
  },
  spotInfo: {
    flex: 1,
    padding: 16,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  availableIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  spotDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  spotAddress: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    flex: 1,
  },
  spotMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  amenityTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  amenityText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});