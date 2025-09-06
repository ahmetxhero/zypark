import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Settings, Car, CreditCard, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, MapPin, Star, Calendar, Globe, Shield, Moon, Sun, Volume2, VolumeX, CreditCard as Edit3, Camera, Phone, Mail, Languages } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import EditProfileModal from '@/components/EditProfileModal';
import VehicleInfoModal from '@/components/VehicleInfoModal';
import PaymentMethodsModal from '@/components/PaymentMethodsModal';
import NotificationSettingsModal from '@/components/NotificationSettingsModal';
import HelpSupportModal from '@/components/HelpSupportModal';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

interface UserStats {
  bookings_count: number;
  spots_count: number;
  total_spent: number;
  total_earned: number;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    bookings_count: 0,
    spots_count: 0,
    total_spent: 0,
    total_earned: 0
  });
  
  // Settings states
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  
  // Modal states
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showVehicleInfo, setShowVehicleInfo] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showHelpSupport, setShowHelpSupport] = useState(false);
  const [showPrivacySecurity, setShowPrivacySecurity] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserStats();
      loadUserSettings();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_stats', {
        user_id_param: user?.id
      });

      if (error) throw error;
      if (data && data.length > 0) {
        setUserStats(data[0]);
      }
    } catch (error: any) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadUserSettings = () => {
    // Load user settings from profile or local storage
    const savedLanguage = languages.find(lang => lang.code === (profile?.language || 'en')) || languages[0];
    setSelectedLanguage(savedLanguage);
    setDarkMode(profile?.dark_mode || false);
    setNotifications(profile?.notifications_enabled !== false);
    setSoundEnabled(profile?.sound_enabled !== false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
              router.replace('/(auth)/welcome');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleLanguageChange = async (language: Language) => {
    setSelectedLanguage(language);
    try {
      await updateProfile({ language: language.code });
      Alert.alert('Success', `Language changed to ${language.name}`);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update language');
    }
    setShowLanguageModal(false);
  };

  const handleSettingToggle = async (setting: string, value: boolean) => {
    try {
      await updateProfile({ [setting]: value });
    } catch (error: any) {
      console.error('Error updating setting:', error);
    }
  };

  const stats = [
    { 
      label: 'Bookings', 
      value: userStats.bookings_count.toString(), 
      icon: Calendar,
      color: '#2563EB'
    },
    { 
      label: 'Rating', 
      value: '4.8', 
      icon: Star,
      color: '#F59E0B'
    },
    { 
      label: 'My Spots', 
      value: userStats.spots_count.toString(), 
      icon: MapPin,
      color: '#059669'
    },
  ];

  const menuSections = [
    {
      title: 'Account',
      items: [
        { 
          id: 'profile', 
          title: 'Edit Profile', 
          icon: User, 
          action: () => setShowEditProfile(true),
          subtitle: 'Update your personal information'
        },
        { 
          id: 'vehicle', 
          title: 'Vehicle Information', 
          icon: Car, 
          action: () => setShowVehicleInfo(true),
          subtitle: 'Manage your vehicle details'
        },
        { 
          id: 'payment', 
          title: 'Payment Methods', 
          icon: CreditCard, 
          action: () => setShowPaymentMethods(true),
          subtitle: 'Cards and payment options'
        },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          id: 'language', 
          title: 'Language', 
          icon: Languages, 
          action: () => setShowLanguageModal(true),
          subtitle: selectedLanguage.nativeName,
          rightElement: <Text style={styles.languageFlag}>{selectedLanguage.flag}</Text>
        },
        { 
          id: 'notifications', 
          title: 'Notifications', 
          icon: Bell, 
          action: () => setShowNotificationSettings(true),
          subtitle: 'Push notifications and alerts'
        },
        { 
          id: 'theme', 
          title: 'Dark Mode', 
          icon: darkMode ? Moon : Sun, 
          action: () => {
            setDarkMode(!darkMode);
            handleSettingToggle('dark_mode', !darkMode);
          },
          rightElement: (
            <Switch
              value={darkMode}
              onValueChange={(value) => {
                setDarkMode(value);
                handleSettingToggle('dark_mode', value);
              }}
              trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
              thumbColor={darkMode ? '#ffffff' : '#f4f3f4'}
            />
          )
        },
        { 
          id: 'sound', 
          title: 'Sound Effects', 
          icon: soundEnabled ? Volume2 : VolumeX, 
          action: () => {
            setSoundEnabled(!soundEnabled);
            handleSettingToggle('sound_enabled', !soundEnabled);
          },
          rightElement: (
            <Switch
              value={soundEnabled}
              onValueChange={(value) => {
                setSoundEnabled(value);
                handleSettingToggle('sound_enabled', value);
              }}
              trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
              thumbColor={soundEnabled ? '#ffffff' : '#f4f3f4'}
            />
          )
        },
      ]
    },
    {
      title: 'Support',
      items: [
        { 
          id: 'help', 
          title: 'Help & Support', 
          icon: HelpCircle, 
          action: () => setShowHelpSupport(true),
          subtitle: 'FAQ, contact us, feedback'
        },
        { 
          id: 'privacy', 
          title: 'Privacy & Security', 
          icon: Shield, 
          action: () => setShowPrivacySecurity(true),
          subtitle: 'Data protection and security'
        },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp} style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.full_name?.charAt(0) || 'U'}
              </Text>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera color="#ffffff" size={16} />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
            <Text style={styles.profileEmail}>{profile?.email || user?.email}</Text>
            {profile?.is_verified && (
              <View style={styles.verifiedBadge}>
                <Shield color="#ffffff" size={12} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => setShowEditProfile(true)}>
            <Edit3 color="#6B7280" size={20} />
          </TouchableOpacity>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Animated.View 
              key={stat.label} 
              entering={FadeInUp.delay(400 + index * 100)}
              style={styles.statCard}
            >
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <stat.icon color={stat.color} size={20} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <Animated.View 
            key={section.title}
            entering={FadeInUp.delay(500 + sectionIndex * 100)}
            style={styles.menuSection}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuContainer}>
              {section.items.map((item, itemIndex) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInUp.delay(600 + sectionIndex * 100 + itemIndex * 50)}
                >
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      itemIndex === section.items.length - 1 && styles.menuItemLast
                    ]}
                    onPress={item.action}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIcon}>
                        <item.icon color="#6B7280" size={20} />
                      </View>
                      <View style={styles.menuItemContent}>
                        <Text style={styles.menuItemText}>{item.title}</Text>
                        {item.subtitle && (
                          <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.menuItemRight}>
                      {item.rightElement || <ChevronRight color="#6B7280" size={20} />}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* Sign Out Button */}
        <Animated.View entering={FadeInUp.delay(800)}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={loading}
          >
            <LogOut color="#DC2626" size={20} />
            <Text style={styles.signOutText}>
              {loading ? 'Signing Out...' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* App Info */}
        <Animated.View entering={FadeInUp.delay(900)} style={styles.appInfo}>
          <Text style={styles.appName}>ZyPark</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </Animated.View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Language</Text>
            <View style={styles.modalSpacer} />
          </View>
          <ScrollView style={styles.modalContent}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  selectedLanguage.code === language.code && styles.languageItemSelected
                ]}
                onPress={() => handleLanguageChange(language)}
              >
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <View style={styles.languageInfo}>
                  <Text style={styles.languageName}>{language.name}</Text>
                  <Text style={styles.languageNative}>{language.nativeName}</Text>
                </View>
                {selectedLanguage.code === language.code && (
                  <View style={styles.selectedIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <EditProfileModal
          visible={showEditProfile}
          onClose={() => setShowEditProfile(false)}
        />
      </Modal>

      {/* Vehicle Info Modal */}
      <Modal
        visible={showVehicleInfo}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVehicleInfo(false)}
      >
        <VehicleInfoModal
          visible={showVehicleInfo}
          onClose={() => setShowVehicleInfo(false)}
        />
      </Modal>

      {/* Payment Methods Modal */}
      <Modal
        visible={showPaymentMethods}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaymentMethods(false)}
      >
        <PaymentMethodsModal
          visible={showPaymentMethods}
          onClose={() => setShowPaymentMethods(false)}
        />
      </Modal>

      {/* Notification Settings Modal */}
      <Modal
        visible={showNotificationSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotificationSettings(false)}
      >
        <NotificationSettingsModal
          visible={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
        />
      </Modal>

      {/* Help & Support Modal */}
      <Modal
        visible={showHelpSupport}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHelpSupport(false)}
      >
        <HelpSupportModal
          visible={showHelpSupport}
          onClose={() => setShowHelpSupport(false)}
        />
      </Modal>

      {/* Privacy & Security Modal */}
      <Modal
        visible={showPrivacySecurity}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacySecurity(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPrivacySecurity(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Privacy & Security</Text>
            <View style={styles.modalSpacer} />
          </View>
          <ScrollView style={styles.modalContent}>
            <Animated.View entering={FadeInUp} style={styles.privacySection}>
              <Shield color="#2563EB" size={24} />
              <Text style={styles.privacyTitle}>Your Data is Protected</Text>
              <Text style={styles.privacyText}>
                We use industry-standard encryption and security measures to protect your personal information and payment data.
              </Text>
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(200)} style={styles.privacyOptions}>
              <TouchableOpacity style={styles.privacyOption}>
                <Text style={styles.privacyOptionTitle}>Data Export</Text>
                <Text style={styles.privacyOptionDescription}>Download your data</Text>
                <ChevronRight color="#6B7280" size={20} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.privacyOption}>
                <Text style={styles.privacyOptionTitle}>Delete Account</Text>
                <Text style={styles.privacyOptionDescription}>Permanently delete your account</Text>
                <ChevronRight color="#6B7280" size={20} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.privacyOption}>
                <Text style={styles.privacyOptionTitle}>Privacy Policy</Text>
                <Text style={styles.privacyOptionDescription}>Read our privacy policy</Text>
                <ChevronRight color="#6B7280" size={20} />
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  editButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginHorizontal: 24,
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  menuItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  menuItemRight: {
    marginLeft: 12,
  },
  languageFlag: {
    fontSize: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
  },
  appInfo: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  appName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  modalSave: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  modalSpacer: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    paddingTop: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  languageItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  languageInfo: {
    flex: 1,
    marginLeft: 12,
  },
  languageName: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  languageNative: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  comingSoon: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },
  privacySection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 24,
  },
  privacyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  privacyOptions: {
    gap: 8,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  privacyOptionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  privacyOptionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginRight: 8,
  },
});