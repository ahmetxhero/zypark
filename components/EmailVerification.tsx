import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface EmailVerificationProps {
  email: string;
  userId: string;
  onVerified: () => void;
  onBack: () => void;
}

export default function EmailVerification({ email, userId, onVerified, onBack }: EmailVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Send initial verification code
    sendVerificationCode();
  }, []);

  useEffect(() => {
    // Countdown timer for resend button
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const sendVerificationCode = async () => {
    try {
      setResendLoading(true);
      
      // Call Supabase function to create verification code
      const { data, error } = await supabase.rpc('create_verification_code', {
        user_email: email,
        user_id_param: userId
      });

      if (error) {
        throw error;
      }

      // In a real app, you would send this code via email
      // For demo purposes, we'll show it in an alert
      Alert.alert(
        'Verification Code Sent',
        `Your verification code is: ${data}\n\n(In production, this would be sent to your email)`,
        [{ text: 'OK' }]
      );

      setTimeLeft(60);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send verification code');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (verificationCode: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('verify_email_code', {
        user_id_param: userId,
        code_param: verificationCode
      });

      if (error) {
        throw error;
      }

      if (data) {
        Alert.alert(
          'Success',
          'Email verified successfully!',
          [{ text: 'OK', onPress: onVerified }]
        );
      } else {
        Alert.alert('Error', 'Invalid or expired verification code');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to verify code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to {email}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Mail color="#2563EB" size={48} />
        </View>

        <Text style={styles.instruction}>
          Enter the verification code sent to your email
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={[
                styles.codeInput,
                digit && styles.codeInputFilled,
                loading && styles.codeInputDisabled
              ]}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              editable={!loading}
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.resendButton,
            (timeLeft > 0 || resendLoading) && styles.resendButtonDisabled
          ]}
          onPress={sendVerificationCode}
          disabled={timeLeft > 0 || resendLoading}
        >
          <Text style={[
            styles.resendButtonText,
            (timeLeft > 0 || resendLoading) && styles.resendButtonTextDisabled
          ]}>
            {resendLoading ? 'Sending...' : timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend Code'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  content: {
    paddingHorizontal: 24,
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  instruction: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  codeInputFilled: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  codeInputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  resendButtonTextDisabled: {
    color: '#9CA3AF',
  },
});