import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import * as Location from 'expo-location';

// Conditionally import MapView only on native platforms
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  const MapViewModule = require('react-native-maps');
  MapView = MapViewModule.default;
  Marker = MapViewModule.Marker;
  PROVIDER_GOOGLE = MapViewModule.PROVIDER_GOOGLE;
}

interface ParkingSpot {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  is_available: boolean;
}

interface MapViewComponentProps {
  parkingSpots: ParkingSpot[];
  onMarkerPress?: (spot: ParkingSpot) => void;
  style?: any;
}

export default function MapViewComponent({ parkingSpots, onMarkerPress, style }: MapViewComponentProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        setErrorMsg('Error getting location');
        console.error('Location error:', error);
      }
    })();
  }, []);

  const initialRegion = {
    latitude: location?.coords.latitude || 37.7749, // Default to San Francisco
    longitude: location?.coords.longitude || -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  if (Platform.OS === 'web') {
    // For web, show a placeholder since react-native-maps doesn't work well on web
    return (
      <View style={[styles.webMapPlaceholder, style]}>
        <View style={styles.webMapContent}>
          <View style={styles.webMapHeader}>
            <View style={styles.webMapDot} />
            <View style={styles.webMapTitle}>Interactive Map</View>
          </View>
          <View style={styles.webMapBody}>
            <View style={styles.webMapText}>
              {parkingSpots.length} parking spots available
            </View>
            <View style={styles.webMapSubtext}>
              Map view is optimized for mobile devices
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <MapView
      style={[styles.map, style]}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      showsUserLocation={true}
      showsMyLocationButton={true}
      showsCompass={true}
      showsScale={true}
    >
      {parkingSpots.map((spot) => (
        <Marker
          key={spot.id}
          coordinate={{
            latitude: spot.latitude,
            longitude: spot.longitude,
          }}
          title={spot.title}
          description={`$${spot.price_per_hour}/hour`}
          pinColor={spot.is_available ? '#059669' : '#DC2626'}
          onPress={() => onMarkerPress?.(spot)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  webMapPlaceholder: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  webMapContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: 300,
    width: '100%',
  },
  webMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  webMapDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
    marginRight: 12,
  },
  webMapTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  webMapBody: {
    alignItems: 'center',
  },
  webMapText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  webMapSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});