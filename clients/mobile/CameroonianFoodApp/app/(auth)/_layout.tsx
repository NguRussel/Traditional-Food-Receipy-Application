import { Stack } from 'expo-router';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme';

export default function AuthLayout() {
  const theme = useTheme<Theme>();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.mainBackground,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="sign-in"
        options={{
          title: 'Sign In',
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: 'Sign Up',
        }}
      />
    </Stack>
  );
}
