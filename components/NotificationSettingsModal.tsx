import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MessageSquare, Calendar, MapPin, CreditCard, Shield } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface NotificationSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: any;
  enabled: boolean;
  category: 'booking' | 'payment' | 'security' | 'marketing';
}

export default function NotificationSettingsModal({ visible, onClose }: NotificationSettingsModalProps) {
  const { profile, updateProfile } = useAuth();
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'booking_confirmations',
      title: 'Booking Confirmations',
      description: 'Get notified when your parking reservations are confirmed',
      icon: Calendar,
      enabled: true,
      category: 'booking'
    },
    {
      id: 'booking_reminders',
      title: 'Booking Reminders',
      description: 'Receive reminders before your parking time starts',
      icon: Bell,
      enabled: true,
      category: 'booking'
    },
    {
      id: 'spot_availability',
      title: 'Spot Availability',
      description: 'Get alerts when parking spots become available in your area',
      icon: MapPin,
      enabled: false,
      category: 'booking'
    },
    {
      id: 'payment_receipts',
      title: 'Payment Receipts',
      description: 'Receive receipts and payment confirmations',
      icon: CreditCard,
      enabled: true,
      category: 'payment'
    },
    {
      id: 'payment_failures',
      title: 'Payment Issues',
      description: 'Get notified if there are any payment problems',
      icon: CreditCard,
      enabled: true,
      category: 'payment'
    },
    {
      id: 'security_alerts',
      title: 'Security Alerts',
      description: 'Important security notifications and account changes',
      icon: Shield,
      enabled: true,
      category: 'security'
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Messages from parking spot owners and support',
      icon: MessageSquare,
      enabled: true,
      category: 'booking'
    }
  ]);

  const handleToggleSetting = async (settingId: string) => {
    const updatedSettings = settings.map(setting =>
      setting.id === settingId
        ? { ...setting, enabled: !setting.enabled }
        : setting
    );
    setSettings(updatedSettings);

    try {
      // Save to profile
      const notificationPreferences = updatedSettings.reduce((acc, setting) => {
        acc[setting.id] = setting.enabled;
        return acc;
      }, {} as Record<string, boolean>);

      await updateProfile({
        notifications_enabled: updatedSettings.some(s => s.enabled),
        // Store detailed preferences in a JSON field if needed
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(setting => setting.category === category);
  };

  const categories = [
    { id: 'booking', title: 'Booking & Parking', description: 'Notifications about your reservations' },
    { id: 'payment', title: 'Payments', description: 'Payment confirmations and issues' },
    { id: 'security', title: 'Security', description: 'Account security and important updates' }
  ];

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <Animated.View entering={FadeInUp} style={styles.globalToggle}>
          <View style={styles.globalToggleInfo}>
            <Bell color="#2563EB" size={24} />
            <View style={styles.globalToggleText}>
              <Text style={styles.globalToggleTitle}>Push Notifications</Text>
              <Text style={styles.globalToggleDescription}>
                Enable or disable all push notifications
              </Text>
            </View>
          </View>
          <Switch
            value={settings.some(s => s.enabled)}
            onValueChange={(value) => {
              const updatedSettings = settings.map(setting => ({
                ...setting,
                enabled: value
              }));
              setSettings(updatedSettings);
            }}
            trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
            thumbColor="#ffffff"
          />
        </Animated.View>

        {categories.map((category, categoryIndex) => (
          <Animated.View 
            key={category.id}
            entering={FadeInUp.delay(200 + categoryIndex * 100)}
            style={styles.categorySection}
          >
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
            
            <View style={styles.settingsGroup}>
              {getSettingsByCategory(category.id).map((setting, index) => (
                <Animated.View
                  key={setting.id}
                  entering={FadeInUp.delay(300 + categoryIndex * 100 + index * 50)}
                  style={[
                    styles.settingItem,
                    index === getSettingsByCategory(category.id).length - 1 && styles.settingItemLast
                  ]}
                >
                  <View style={styles.settingInfo}>
                    <View style={styles.settingIcon}>
                      <setting.icon color="#6B7280" size={20} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>{setting.title}</Text>
                      <Text style={styles.settingDescription}>{setting.description}</Text>
                    </View>
                  </View>
                  <Switch
                    value={setting.enabled}
                    onValueChange={() => handleToggleSetting(setting.id)}
                    trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
                    thumbColor="#ffffff"
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInUp.delay(600)} style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Notifications</Text>
          <Text style={styles.infoText}>
            You can manage your notification preferences here. Some security notifications cannot be disabled to keep your account safe.
          </Text>
        </Animated.View>
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
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  globalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  globalToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  globalToggleText: {
    marginLeft: 16,
    flex: 1,
  },
  globalToggleTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  globalToggleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  settingsGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  infoSection: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    lineHeight: 16,
  },
});