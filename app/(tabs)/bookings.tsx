import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, Star, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

export default function BookingsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reservations, setReservations] = useState({ upcoming: [], completed: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadReservations();
    }
  }, [user]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          parking_spots (
            title,
            address,
            images
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const now = new Date();
      const upcoming = data?.filter(reservation => 
        new Date(reservation.end_time) > now && 
        ['pending', 'confirmed'].includes(reservation.status)
      ) || [];
      
      const completed = data?.filter(reservation => 
        new Date(reservation.end_time) <= now || 
        reservation.status === 'completed'
      ) || [];

      setReservations({ upcoming, completed });
    } catch (error: any) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'upcoming', name: 'Upcoming', count: reservations.upcoming.length },
    { id: 'completed', name: 'Completed', count: reservations.completed.length },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#059669';
      case 'completed':
        return '#6B7280';
      case 'cancelled':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInUp} style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200)} style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.name} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Animated.View entering={FadeInUp} style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading reservations...</Text>
          </Animated.View>
        ) : (
          reservations[activeTab as keyof typeof reservations].map((booking: any, index) => (
            <Animated.View 
              key={booking.id} 
              entering={FadeInUp.delay(300 + index * 100)}
              style={styles.bookingCard}
            >
              <Image
                source={{ uri: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=400' }}
                style={styles.bookingImage}
              />
              
              <View style={styles.bookingContent}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingTitle}>{booking.parking_spots?.title}</Text>
                  <TouchableOpacity>
                    <MoreHorizontal color="#6B7280" size={20} />
                  </TouchableOpacity>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <MapPin color="#6B7280" size={14} />
                    <Text style={styles.bookingAddress}>{booking.parking_spots?.address}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Calendar color="#6B7280" size={14} />
                    <Text style={styles.bookingDate}>
                      {new Date(booking.start_time).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Clock color="#6B7280" size={14} />
                    <Text style={styles.bookingTime}>
                      {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingFooter}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.bookingPrice}>${booking.total_price}</Text>
                    <Text style={styles.priceLabel}>total</Text>
                  </View>
                  
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(booking.status) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(booking.status) },
                      ]}
                    >
                      {booking.status}
                    </Text>
                  </View>
                </View>

                {booking.status === 'completed' && !booking.rating && (
                  <View style={styles.ratingContainer}>
                    <Star color="#F59E0B" size={16} fill="#F59E0B" />
                    <Text style={styles.ratingText}>
                      Leave a review
                    </Text>
                  </View>
                )}

                {booking.status === 'confirmed' && (
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </Animated.View>
          ))
        )}

        {!loading && reservations[activeTab as keyof typeof reservations].length === 0 && (
          <Animated.View entering={FadeInUp} style={styles.emptyState}>
            <Calendar color="#6B7280" size={48} />
            <Text style={styles.emptyStateTitle}>No bookings yet</Text>
            <Text style={styles.emptyStateText}>
              Start exploring parking spots and make your first reservation!
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  activeTab: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#2563EB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookingImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  bookingContent: {
    padding: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  bookingDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    flex: 1,
  },
  bookingDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  bookingTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  bookingPrice: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});