import { StatusBar } from 'expo-status-bar';
import { StyleSheet, 
  Text, KeyboardAvoidingView,
  Platform, View
 } from 'react-native';  
 import CustomInput from './src/components/CustomInput';
import CustomButton from './src/components/CustomButton';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

const signInSchema = z.object({
  email: z.string({message: 'Email is required'}).email('Invalid email address'),
  password: z.string({message: 'Password is required'})
    .min(8, 'Password must be at least 8 characters long')
});

type SignInFields = z.infer<typeof signInSchema>;

export default function App() {
  const {control, handleSubmit, formState: {errors}} = useForm({
    resolver: zodResolver(signInSchema)
  });

  console.log( errors);
  // This function will be called when the form is submitted

  const onSignIn = (data: SignInFields) => {
    console.warn('Sign In: ', data.email, data.password);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

    
      
      <View style={styles.form}>

      <CustomInput 
      control={control}
      name='email'
      placeholder='Email' 
      autoFocus
      autoCapitalize='none'
      keyboardType='email-address'
      autoComplete='email' />

      <CustomInput
      control={control}
      name='password'
      placeholder='Password'
      secureTextEntry/>
      </View>
      <CustomButton 
      text='Sign in' onPress={handleSubmit(onSignIn)}/>

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
  form: {
    gap: 5,
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
