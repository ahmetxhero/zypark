import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Plus, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'discover';
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface PaymentMethodsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PaymentMethodsModal({ visible, onClose }: PaymentMethodsModalProps) {
  const { profile, updateProfile } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '25',
      isDefault: true
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '5555',
      expiryMonth: '08',
      expiryYear: '26',
      isDefault: false
    }
  ]);

  const getCardIcon = (type: string) => {
    const cardColors = {
      visa: '#1A1F71',
      mastercard: '#EB001B',
      amex: '#006FCF',
      discover: '#FF6000'
    };
    return cardColors[type as keyof typeof cardColors] || '#6B7280';
  };

  const handleAddCard = () => {
    Alert.alert(
      'Add Payment Method',
      'This feature will integrate with Stripe for secure payment processing.',
      [{ text: 'OK' }]
    );
  };

  const handleRemoveCard = (cardId: string) => {
    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(methods => methods.filter(m => m.id !== cardId));
          }
        }
      ]
    );
  };

  const handleSetDefault = (cardId: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === cardId
      }))
    );
  };

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
        <TouchableOpacity onPress={handleAddCard}>
          <Plus color="#2563EB" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {paymentMethods.length === 0 ? (
          <Animated.View entering={FadeInUp} style={styles.emptyState}>
            <CreditCard color="#6B7280" size={48} />
            <Text style={styles.emptyTitle}>No payment methods</Text>
            <Text style={styles.emptyText}>
              Add a payment method to make reservations easier
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
              <Plus color="#ffffff" size={20} />
              <Text style={styles.addButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Saved Cards</Text>
            {paymentMethods.map((method, index) => (
              <Animated.View 
                key={method.id}
                entering={FadeInUp.delay(index * 100)}
                style={styles.cardItem}
              >
                <View style={styles.cardInfo}>
                  <View style={[styles.cardIcon, { backgroundColor: getCardIcon(method.type) }]}>
                    <CreditCard color="#ffffff" size={20} />
                  </View>
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardType}>
                      {method.type.charAt(0).toUpperCase() + method.type.slice(1)} •••• {method.last4}
                    </Text>
                    <Text style={styles.cardExpiry}>
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </Text>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.cardActions}>
                  {!method.isDefault && (
                    <TouchableOpacity
                      style={styles.setDefaultButton}
                      onPress={() => handleSetDefault(method.id)}
                    >
                      <Text style={styles.setDefaultText}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveCard(method.id)}
                  >
                    <Trash2 color="#DC2626" size={16} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}

            <Animated.View entering={FadeInUp.delay(300)} style={styles.addCardButton}>
              <TouchableOpacity style={styles.addCardTouchable} onPress={handleAddCard}>
                <Plus color="#2563EB" size={20} />
                <Text style={styles.addCardText}>Add New Payment Method</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}

        <Animated.View entering={FadeInUp.delay(400)} style={styles.securityInfo}>
          <Text style={styles.securityTitle}>Secure Payments</Text>
          <Text style={styles.securityText}>
            Your payment information is encrypted and securely stored. We use industry-standard security measures to protect your data.
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
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  cardType: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  defaultBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  defaultText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setDefaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  setDefaultText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  removeButton: {
    padding: 8,
  },
  addCardButton: {
    marginTop: 16,
  },
  addCardTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addCardText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  securityInfo: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  securityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#166534',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#166534',
    lineHeight: 16,
  },
});