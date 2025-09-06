import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleHelp as HelpCircle, MessageCircle, Phone, Mail, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface HelpSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'booking' | 'payment' | 'account' | 'general';
}

export default function HelpSupportModal({ visible, onClose }: HelpSupportModalProps) {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How do I make a parking reservation?',
      answer: 'To make a reservation, search for parking spots in your desired location, select a spot, choose your time, and complete the payment. You\'ll receive a confirmation with all the details.',
      category: 'booking'
    },
    {
      id: '2',
      question: 'Can I cancel my reservation?',
      answer: 'Yes, you can cancel your reservation up to 1 hour before the start time for a full refund. Cancellations made less than 1 hour before will incur a 50% cancellation fee.',
      category: 'booking'
    },
    {
      id: '3',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) and digital wallets like Apple Pay and Google Pay.',
      category: 'payment'
    },
    {
      id: '4',
      question: 'How do I get a refund?',
      answer: 'Refunds are processed automatically for eligible cancellations. For other refund requests, please contact our support team. Refunds typically take 3-5 business days to appear in your account.',
      category: 'payment'
    },
    {
      id: '5',
      question: 'How do I update my profile information?',
      answer: 'Go to your Profile tab, tap "Edit Profile", make your changes, and save. You can update your name, email, phone number, and other personal information.',
      category: 'account'
    },
    {
      id: '6',
      question: 'Is my parking spot guaranteed?',
      answer: 'Yes, once you receive a confirmation, your parking spot is guaranteed. If there are any issues, we\'ll help you find an alternative spot or provide a full refund.',
      category: 'general'
    },
    {
      id: '7',
      question: 'What if I can\'t find my reserved parking spot?',
      answer: 'If you can\'t locate your spot, check the confirmation details for specific instructions. You can also contact the spot owner through the app or call our support team for immediate assistance.',
      category: 'general'
    },
    {
      id: '8',
      question: 'How do I become a parking spot host?',
      answer: 'To list your parking spot, tap the "+" button on the map screen, provide details about your spot, set your pricing, and submit for approval. We\'ll review and activate your listing within 24 hours.',
      category: 'general'
    }
  ];

  const categories = [
    { id: 'general', name: 'General', count: faqData.filter(f => f.category === 'general').length },
    { id: 'booking', name: 'Booking', count: faqData.filter(f => f.category === 'booking').length },
    { id: 'payment', name: 'Payment', count: faqData.filter(f => f.category === 'payment').length },
    { id: 'account', name: 'Account', count: faqData.filter(f => f.category === 'account').length },
  ];

  const contactOptions = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: MessageCircle,
      action: () => Alert.alert('Live Chat', 'Live chat feature coming soon!')
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'support@zypark.com',
      icon: Mail,
      action: () => Linking.openURL('mailto:support@zypark.com')
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: '+1 (555) 123-4567',
      icon: Phone,
      action: () => Linking.openURL('tel:+15551234567')
    }
  ];

  const handleFAQToggle = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const filteredFAQs = faqData.filter(faq => faq.category === selectedCategory);

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Contact Options */}
        <Animated.View entering={FadeInUp} style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option, index) => (
              <Animated.View 
                key={option.id}
                entering={FadeInUp.delay(100 + index * 50)}
              >
                <TouchableOpacity style={styles.contactOption} onPress={option.action}>
                  <View style={styles.contactIcon}>
                    <option.icon color="#2563EB" size={24} />
                  </View>
                  <Text style={styles.contactTitle}>{option.title}</Text>
                  <Text style={styles.contactDescription}>{option.description}</Text>
                  <ExternalLink color="#6B7280" size={16} style={styles.externalIcon} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* FAQ Section */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
            contentContainerStyle={styles.categoryFilterContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextActive
                ]}>
                  {category.name} ({category.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FAQ Items */}
          <View style={styles.faqContainer}>
            {filteredFAQs.map((faq, index) => (
              <Animated.View 
                key={faq.id}
                entering={FadeInUp.delay(400 + index * 50)}
                style={styles.faqItem}
              >
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => handleFAQToggle(faq.id)}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  {expandedFAQ === faq.id ? (
                    <ChevronDown color="#6B7280" size={20} />
                  ) : (
                    <ChevronRight color="#6B7280" size={20} />
                  )}
                </TouchableOpacity>
                {expandedFAQ === faq.id && (
                  <Animated.View entering={FadeInUp} style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </Animated.View>
                )}
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Additional Resources */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          <View style={styles.resourcesContainer}>
            <TouchableOpacity style={styles.resourceItem}>
              <HelpCircle color="#2563EB" size={20} />
              <Text style={styles.resourceText}>User Guide</Text>
              <ExternalLink color="#6B7280" size={16} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceItem}>
              <HelpCircle color="#2563EB" size={20} />
              <Text style={styles.resourceText}>Terms of Service</Text>
              <ExternalLink color="#6B7280" size={16} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceItem}>
              <HelpCircle color="#2563EB" size={20} />
              <Text style={styles.resourceText}>Privacy Policy</Text>
              <ExternalLink color="#6B7280" size={16} />
            </TouchableOpacity>
          </View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  contactGrid: {
    gap: 12,
  },
  contactOption: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  contactIcon: {
    marginRight: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  contactDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginRight: 8,
  },
  externalIcon: {
    position: 'absolute',
    right: 16,
  },
  categoryFilter: {
    marginBottom: 16,
  },
  categoryFilterContent: {
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  faqContainer: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  faqAnswerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 12,
  },
  resourcesContainer: {
    gap: 8,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
  },
  resourceText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    flex: 1,
    marginLeft: 12,
  },
});