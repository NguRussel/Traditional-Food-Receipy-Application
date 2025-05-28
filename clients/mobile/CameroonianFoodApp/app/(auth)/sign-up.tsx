import { View, TextInput, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const theme = useTheme<Theme>();

  const handleSignUp = async () => {
    // TODO: Implement sign up logic
    try {
      if (password !== confirmPassword) {
        console.error('Passwords do not match');
        return;
      }
      // Call authentication service
      console.log('Signing up with:', email);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  return (
    <View style={{ 
      flex: 1, 
      padding: theme.spacing.m,
      backgroundColor: theme.colors.mainBackground 
    }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{
          padding: theme.spacing.s,
          marginBottom: theme.spacing.m,
          borderWidth: 1,
          borderColor: theme.colors.gray,
          borderRadius: 4
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          padding: theme.spacing.s,
          marginBottom: theme.spacing.m,
          borderWidth: 1,
          borderColor: theme.colors.gray,
          borderRadius: 4
        }}
      />
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={{
          padding: theme.spacing.s,
          marginBottom: theme.spacing.m,
          borderWidth: 1,
          borderColor: theme.colors.gray,
          borderRadius: 4
        }}
      />
      <TouchableOpacity
        onPress={handleSignUp}
        style={{
          backgroundColor: theme.colors.primary,
          padding: theme.spacing.m,
          borderRadius: 4,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: theme.colors.white }}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/sign-in')}
        style={{
          marginTop: theme.spacing.m,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: theme.colors.primary }}>
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}
