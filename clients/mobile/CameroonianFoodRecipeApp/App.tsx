import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Image,Pressable } from 'react-native';  

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput placeholder='Email' style={styles.input}/>
      <TextInput placeholder='Password' style={styles.input} secureTextEntry={true}/>

      <Pressable
        onPress={() => {console.log('pressed')}}>
        <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
      <StatusBar style="auto" />
    </View>
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
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: '#ccc'
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
