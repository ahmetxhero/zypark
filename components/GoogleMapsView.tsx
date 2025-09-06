import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity } from 'react-native';
import { MapPin, Navigation, Zap } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

interface ParkingSpot {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  is_available: boolean;
  amenities?: any;
}

interface GoogleMapsViewProps {
  parkingSpots: ParkingSpot[];
  onMarkerPress?: (spot: ParkingSpot) => void;
  style?: any;
  userLocation?: { latitude: number; longitude: number } | null;
}

export default function GoogleMapsView({ 
  parkingSpots, 
  onMarkerPress, 
  style,
  userLocation 
}: GoogleMapsViewProps) {
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);

  // For web, we'll create a beautiful interactive map placeholder
  // In production, you would integrate with Google Maps JavaScript API
  
  const handleSpotPress = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
    onMarkerPress?.(spot);
  };

  const availableSpots = parkingSpots.filter(spot => spot.is_available);
  const occupiedSpots = parkingSpots.filter(spot => !spot.is_available);

  return (
    <View style={[styles.container, style]}>
      {/* Map Header */}
      <Animated.View entering={FadeInUp.delay(200)} style={styles.mapHeader}>
        <View style={styles.locationInfo}>
          <Navigation color="#2563EB" size={20} />
          <Text style={styles.locationText}>San Francisco, CA</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: '#059669' }]} />
            <Text style={styles.statText}>{availableSpots.length} Available</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: '#DC2626' }]} />
            <Text style={styles.statText}>{occupiedSpots.length} Occupied</Text>
          </View>
        </View>
      </Animated.View>

      {/* Interactive Map Area */}
      <View style={styles.mapArea}>
        <View style={styles.mapGrid}>
          {/* Simulated map with parking spots */}
          {parkingSpots.slice(0, 8).map((spot, index) => (
            <Animated.View
              key={spot.id}
              entering={FadeInUp.delay(300 + index * 100)}
              style={[
                styles.mapMarker,
                {
                  left: `${20 + (index % 3) * 25}%`,
                  top: `${20 + Math.floor(index / 3) * 20}%`,
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.markerButton,
                  { 
                    backgroundColor: spot.is_available ? '#059669' : '#DC2626',
                    transform: selectedSpot?.id === spot.id ? [{ scale: 1.2 }] : [{ scale: 1 }]
                  }
                ]}
                onPress={() => handleSpotPress(spot)}
              >
                <MapPin color="#ffffff" size={16} />
                <Text style={styles.markerPrice}>${spot.price_per_hour}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}

          {/* User location marker */}
          {userLocation && (
            <Animated.View
              entering={FadeInUp.delay(600)}
              style={[styles.userMarker, { left: '50%', top: '50%' }]}
            >
              <View style={styles.userDot} />
              <View style={styles.userPulse} />
            </Animated.View>
          )}
        </View>

        {/* Map Controls */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Navigation color="#374151" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Zap color="#374151" size={20} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Selected Spot Info */}
      {selectedSpot && (
        <Animated.View entering={FadeInUp} style={styles.spotInfo}>
          <View style={styles.spotInfoHeader}>
            <Text style={styles.spotTitle}>{selectedSpot.title}</Text>
            <Text style={styles.spotPrice}>${selectedSpot.price_per_hour}/hour</Text>
          </View>
          <View style={styles.spotAmenities}>
            {selectedSpot.amenities?.ev_charging && (
              <View style={styles.amenityTag}>
                <Zap color="#059669" size={12} />
                <Text style={styles.amenityText}>EV Charging</Text>
              </View>
            )}
            {selectedSpot.amenities?.covered && (
              <View style={styles.amenityTag}>
                <Text style={styles.amenityText}>Covered</Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      {/* Map Attribution */}
      <View style={styles.attribution}>
        <Text style={styles.attributionText}>
          Interactive Map • {parkingSpots.length} spots nearby
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  mapGrid: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  mapMarker: {
    position: 'absolute',
    zIndex: 10,
  },
  markerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerPrice: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  userMarker: {
    position: 'absolute',
    zIndex: 20,
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  userDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    opacity: 0.3,
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  spotInfo: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  spotInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  spotPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  spotAmenities: {
    flexDirection: 'row',
    gap: 8,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  amenityText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  attribution: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attributionText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});