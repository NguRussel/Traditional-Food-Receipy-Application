import { View, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '@shopify/restyle/dist/components';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const theme = useTheme<Theme>();

  const handleSignIn = async () => {
    // TODO: Implement sign in logic
    try {
      // Call authentication service
      console.log('Signing in with:', email);
    } catch (error) {
      console.error('Sign in error:', error);
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
      <TouchableOpacity
        onPress={handleSignIn}
        style={{
          backgroundColor: theme.colors.primary,
          padding: theme.spacing.m,
          borderRadius: 4,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: theme.colors.white }}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/sign-up')}
        style={{
          marginTop: theme.spacing.m,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: theme.colors.primary }}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}
