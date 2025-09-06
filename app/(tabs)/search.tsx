import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Star, Filter, Navigation } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

export default function SearchScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { id: 'all', name: 'All' },
    { id: 'residential', name: 'Residential' },
    { id: 'commercial', name: 'Commercial' },
    { id: 'covered', name: 'Covered' },
    { id: 'electric', name: 'EV Charging' },
    { id: 'nearby', name: 'Nearby' },
  ];

  useEffect(() => {
    if (user) {
      searchParkingSpots();
    }
  }, [user, selectedFilter]);

  const searchParkingSpots = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('parking_spots')
        .select(`
          *,
          categories (
            name,
            icon
          )
        `)
        .eq('is_active', true)
        .limit(20); // Limit results for better performance

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply filters
      if (selectedFilter !== 'all') {
        switch (selectedFilter) {
          case 'residential':
            query = query.eq('categories.name', 'Residential');
            break;
          case 'commercial':
            query = query.eq('categories.name', 'Commercial');
            break;
          case 'covered':
            query = query.eq('categories.name', 'Covered');
            break;
          case 'electric':
            query = query.eq('categories.name', 'Electric');
            break;
          case 'nearby':
            // For demo, just order by created_at
            query = query.order('created_at', { ascending: false });
            break;
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setParkingSpots(data || []);
    } catch (error: any) {
      console.error('Error searching parking spots:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedFilter]);

  const handleSearch = () => {
    searchParkingSpots();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    searchParkingSpots();
  }, [searchParkingSpots]);

  const calculateDistance = (spot: any) => {
    // Simulate distance calculation
    return (Math.random() * 5).toFixed(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInUp} style={styles.header}>
        <Text style={styles.title}>Find Parking</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color="#1F2937" size={18} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(100)} style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#6B7280" size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location or address"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </Animated.View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter, index) => (
          <Animated.View key={filter.id} entering={FadeInUp.delay(200 + index * 50)}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.id && styles.filterChipTextActive,
                ]}
              >
                {filter.name}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View entering={FadeInUp.delay(300)} style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Available Spots</Text>
          <View style={styles.resultsInfo}>
            <Navigation color="#2563EB" size={16} />
            <Text style={styles.resultsCount}>
              {loading ? 'Searching...' : `${parkingSpots.length} results`}
            </Text>
          </View>
        </Animated.View>

        {loading && parkingSpots.length === 0 ? (
          <Animated.View entering={FadeInUp} style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Finding parking spots...</Text>
          </Animated.View>
        ) : (
          parkingSpots.map((spot: any, index) => (
            <Animated.View 
              key={spot.id}
              entering={FadeInUp.delay(400 + index * 100)}
            >
              <TouchableOpacity style={styles.spotCard}>
                <View style={styles.spotImageContainer}>
                  <Image
                    source={{ uri: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=400' }}
                    style={styles.spotImage}
                  />
                  {spot.is_available && (
                    <View style={styles.availableBadge}>
                      <Text style={styles.availableBadgeText}>Available</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.spotContent}>
                  <View style={styles.spotHeader}>
                    <Text style={styles.spotTitle} numberOfLines={1}>{spot.title}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.spotPrice}>${spot.price_per_hour}</Text>
                      <Text style={styles.spotPriceUnit}>/hr</Text>
                    </View>
                  </View>
                  
                  <View style={styles.spotDetails}>
                    <MapPin color="#6B7280" size={12} />
                    <Text style={styles.spotAddress} numberOfLines={1}>{spot.address}</Text>
                  </View>
                  
                  <View style={styles.spotMeta}>
                    <View style={styles.ratingContainer}>
                      <Star color="#F59E0B" size={12} fill="#F59E0B" />
                      <Text style={styles.rating}>4.5</Text>
                    </View>
                    <Text style={styles.distance}>{calculateDistance(spot)} miles away</Text>
                  </View>

                  <View style={styles.amenitiesContainer}>
                    {spot.amenities?.ev_charging && (
                      <View style={styles.amenityTag}>
                        <Text style={styles.amenityText}>EV</Text>
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
          ))
        )}

        {!loading && parkingSpots.length === 0 && (
          <Animated.View entering={FadeInUp} style={styles.emptyState}>
            <Search color="#6B7280" size={48} />
            <Text style={styles.emptyStateTitle}>No parking spots found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search criteria or location
            </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  filtersContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filtersContent: {
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  resultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  spotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  spotImageContainer: {
    position: 'relative',
  },
  spotImage: {
    width: '100%',
    height: 160,
  },
  availableBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availableBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  spotContent: {
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
    marginRight: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  spotPrice: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  spotPriceUnit: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  spotDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  spotAddress: {
    fontSize: 14,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  distance: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 250,
  },
});