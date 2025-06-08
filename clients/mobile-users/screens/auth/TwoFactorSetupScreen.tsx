import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';

type TwoFactorSetupScreenNavigationProp = StackNavigationProp<any, 'TwoFactorSetup'>;

interface Props {
  navigation: TwoFactorSetupScreenNavigationProp;
}

export default function TwoFactorSetupScreen({ navigation }: Props) {
  const { enableTwoFactor, verifyTwoFactor, getTwoFactorStatus } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<'setup' | 'verify'>('setup');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    const { enabled } = await getTwoFactorStatus();
    setIs2FAEnabled(enabled);
    
    if (enabled) {
      navigation.goBack();
    }
  };

  const handleEnable2FA = async () => {
    setLoading(true);

    try {
      const { error, qrCode: qrCodeData, secret: secretKey } = await enableTwoFactor();

      if (error) {
        Alert.alert('Setup Failed', error.message);
      } else if (qrCodeData && secretKey) {
        setQrCode(qrCodeData);
        setSecret(secretKey);
        setCurrentStep('verify');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const { error } = await verifyTwoFactor(verificationCode);

      if (error) {
        Alert.alert('Verification Failed', error.message);
      } else {
        Toast.show({
          type: 'success',
          text1: '🔐 2FA Enabled Successfully!',
          text2: 'Your account is now more secure',
        });
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = async () => {
    await Clipboard.setStringAsync(secret);
    Toast.show({
      type: 'success',
      text1: '📋 Secret Copied',
      text2: 'Secret key copied to clipboard',
    });
  };

  const openAuthenticatorApp = () => {
    const authenticatorApps = [
      'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2',
      'https://apps.apple.com/app/google-authenticator/id388497605',
    ];
    
    Alert.alert(
      'Download Authenticator App',
      'You need an authenticator app to generate codes. Popular options include Google Authenticator, Authy, or Microsoft Authenticator.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Download', 
          onPress: () => Linking.openURL(authenticatorApps[0])
        },
      ]
    );
  };

  const renderSetupStep = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Setup Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>
          Add an extra layer of security to your account with 2FA
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.securityCard}>
          <Ionicons name="shield-checkmark" size={48} color={Colors.light.primary} />
          <Text style={styles.securityTitle}>Enhanced Security</Text>
          <Text style={styles.securityDescription}>
            Two-factor authentication protects your account even if someone knows your password.
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>How it works:</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Download an Authenticator App</Text>
              <Text style={styles.stepDescription}>
                Install Google Authenticator, Authy, or any TOTP app
              </Text>
              <TouchableOpacity style={styles.downloadButton} onPress={openAuthenticatorApp}>
                <Ionicons name="download" size={16} color={Colors.light.primary} />
                <Text style={styles.downloadButtonText}>Download App</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Scan QR Code</Text>
              <Text style={styles.stepDescription}>
                Use your authenticator app to scan the QR code we'll show you
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Verify Setup</Text>
              <Text style={styles.stepDescription}>
                Enter the 6-digit code from your app to complete setup
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.setupButton, loading && styles.setupButtonDisabled]} 
          onPress={handleEnable2FA}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={20} color="white" />
              <Text style={styles.setupButtonText}>Start Setup</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderVerifyStep = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentStep('setup')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Scan QR Code</Text>
        <Text style={styles.subtitle}>
          Use your authenticator app to scan this QR code
        </Text>
      </View>

      <View style={styles.qrContainer}>
        {qrCode && (
          <View style={styles.qrCodeWrapper}>
            <QRCode
              value={qrCode}
              size={200}
              backgroundColor="white"
              color={Colors.light.text}
            />
          </View>
        )}

        <View style={styles.secretContainer}>
          <Text style={styles.secretLabel}>Can't scan? Enter this code manually:</Text>
          <View style={styles.secretRow}>
            <Text style={styles.secretText}>{secret}</Text>
            <TouchableOpacity onPress={copySecret} style={styles.copyButton}>
              <Ionicons name="copy" size={16} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.verificationSection}>
          <Text style={styles.verificationLabel}>
            Enter the 6-digit code from your authenticator app:
          </Text>
          
          <TextInput
            style={styles.codeInput}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="000000"
            placeholderTextColor={Colors.light.textSecondary}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />

          <TouchableOpacity 
            style={[
              styles.verifyButton, 
              loading && styles.verifyButtonDisabled,
              verificationCode.length !== 6 && styles.verifyButtonDisabled
            ]} 
            onPress={handleVerify2FA}
            disabled={loading || verificationCode.length !== 6}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.verifyButtonText}>Complete Setup</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {currentStep === 'setup' ? renderSetupStep() : renderVerifyStep()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  securityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  securityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  securityDescription: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepsContainer: {
    marginBottom: 30,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  downloadButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  setupButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupButtonDisabled: {
    backgroundColor: Colors.light.textSecondary,
  },
  setupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
  },
  qrCodeWrapper: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  secretContainer: {
    width: '100%',
    marginBottom: 40,
  },
  secretLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  secretRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secretText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  copyButton: {
    marginLeft: 10,
  },
  verificationSection: {
    width: '100%',
    alignItems: 'center',
  },
  verificationLabel: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  codeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    minWidth: 200,
    color: Colors.light.text,
    backgroundColor: 'white',
    marginBottom: 30,
  },
  verifyButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
    minWidth: 200,
  },
  verifyButtonDisabled: {
    backgroundColor: Colors.light.textSecondary,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});