import { StatusBar } from 'expo-status-bar';
import { StyleSheet, 
  Text, TextInput, View, TouchableOpacity, Image,Pressable, KeyboardAvoidingView,
  Platform,
 } from 'react-native';  
 import CustomInput from './src/components/CustomInput';
import CustomButton from './src/components/CustomButton';

export default function App() {
  return (
    <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      

      <CustomInput 
      placeholder='Email' 
      autoFocus
      autoCapitalize='none'
      keyboardType='email-address'
      autoComplete='email' />
      <CustomInput placeholder='Password' secureTextEntry={true} />
      
      <CustomButton 
      text='Sign in'
      onPress={() => {
        console.log('pressed')
        }}
        />

      <Pressable
        onPress={() => {console.log('pressed')}}>
        <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    backgroundColor: '#007BFF',
    padding: 10,
    textAlign: 'center',
    borderRadius: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#4353FD',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  }
});
