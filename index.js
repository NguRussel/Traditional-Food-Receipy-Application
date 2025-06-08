import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Create a stack navigator
const Stack = createNativeStackNavigator();

// Home screen component
function HomeScreen() {
return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
<Text>Home Screen</Text>
    </View>
);
}

// Main naviga    tion component
export default function AppNavigation() {
return (
    <NavigationContainer>
<Stack.Navigator
    initialRouteName="welcome"
    screensOptions={{
headerShown:false, 
}}
    >
        <Stack.Screen name="Home" component={Homescreen} />
            <Stack.Screen name="Welcome" component={Welcomescreen} />
    </Stack.Navigator>
    </NavigationContainer>
);
}