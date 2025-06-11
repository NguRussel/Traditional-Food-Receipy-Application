import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ThemeConfig } from '../../constants/Colors';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'recipe' | 'suggestion';
}

interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  action: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'recipe-help',
    title: 'Recipe Help',
    icon: 'restaurant-outline',
    description: 'Get cooking assistance',
    action: 'recipe-help',
  },
  {
    id: 'substitute',
    title: 'Ingredient Substitute',
    icon: 'swap-horizontal-outline',
    description: 'Find alternatives',
    action: 'substitute',
  },
  {
    id: 'cooking-tips',
    title: 'Cooking Tips',
    icon: 'bulb-outline',
    description: 'Learn techniques',
    action: 'cooking-tips',
  },
  {
    id: 'meal-plan',
    title: 'Meal Planning',
    icon: 'calendar-outline',
    description: 'Plan your meals',
    action: 'meal-plan',
  },
];

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm your Cameroonian cooking assistant. I can help you with recipes, cooking techniques, ingredient substitutes, and meal planning. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setShowQuickActions(false);
    setIsProcessing(true);

    // Simulate AI response - in real app, this would call your AI-ASSISTANT-SERVICE
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase();
    
    let response = '';
    let type: 'text' | 'recipe' | 'suggestion' = 'text';

    if (input.includes('ndole') || input.includes('ndolé')) {
      response = "Ndolé is Cameroon's national dish! It's a delicious stew made with bitter leaves (vernonia), groundnuts, and your choice of fish, beef, or dried fish. Here are the key steps:\n\n1. Clean and boil the bitter leaves\n2. Prepare groundnut paste\n3. Season your protein\n4. Combine everything and simmer\n\nWould you like the complete recipe with measurements?";
      type = 'recipe';
    } else if (input.includes('substitute') || input.includes('alternative')) {
      response = "I can help with ingredient substitutes! For Cameroonian cooking:\n\n• Bitter leaves → Spinach + kale mix\n• Palm oil → Coconut oil (different flavor)\n• Groundnuts → Peanut butter\n• Plantain → Sweet potato\n• Crayfish → Shrimp powder\n\nWhat specific ingredient do you need to substitute?";
      type = 'suggestion';
    } else if (input.includes('achu') || input.includes('yellow soup')) {
      response = "Achu soup is a traditional Northwest Cameroonian dish! It's a yellow soup made with palm nut extract, served with pounded cocoyam (achu). The soup typically includes fish, meat, and vegetables like okra and spinach.\n\nKey ingredients:\n• Palm nuts\n• Smoked fish\n• Beef or chicken\n• Vegetables\n• Spices\n\nWould you like cooking instructions?";
      type = 'recipe';
    } else if (input.includes('poulet dg') || input.includes('chicken')) {
      response = "Poulet DG is a popular Cameroonian dish! 'DG' stands for 'Directeur Général' (CEO) because it was considered fancy. It's chicken cooked with plantains, carrots, and green beans.\n\nQuick tips:\n• Use ripe but firm plantains\n• Season chicken well before cooking\n• Cook vegetables separately first\n• Combine everything at the end\n\nShall I walk you through the complete recipe?";
      type = 'recipe';
    } else if (input.includes('cooking tip') || input.includes('technique')) {
      response = "Here are some essential Cameroonian cooking tips:\n\n🔥 Always bloom your spices in oil first\n🥄 Use wooden spoons for stirring traditional dishes\n🧄 Pound garlic and ginger together for better flavor\n🐟 Soak dried fish before adding to dishes\n🥥 Toast groundnuts for richer taste\n\nWhat specific technique would you like to learn more about?";
      type = 'suggestion';
    } else if (input.includes('meal plan') || input.includes('planning')) {
      response = "I can help you plan traditional Cameroonian meals! Here's a sample week:\n\n📅 Monday: Jollof Rice with Plantain\n📅 Tuesday: Ndolé with Fufu\n📅 Wednesday: Pepper Soup with Yam\n📅 Thursday: Achu Soup\n📅 Friday: Poulet DG\n📅 Weekend: Grilled Fish with Attieké\n\nWould you like me to customize a meal plan based on your preferences?";
      type = 'suggestion';
    } else {
      response = "I'm here to help with Cameroonian cooking! You can ask me about:\n\n🍲 Traditional recipes (Ndolé, Achu, Poulet DG)\n🥘 Cooking techniques and tips\n🔄 Ingredient substitutions\n📅 Meal planning\n🌶️ Spice combinations\n\nWhat would you like to learn today?";
      type = 'suggestion';
    }

    return {
      id: Date.now().toString(),
      text: response,
      isUser: false,
      timestamp: new Date(),
      type,
    };
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: { [key: string]: string } = {
      'recipe-help': "I need help with a Cameroonian recipe",
      'substitute': "What can I substitute for an ingredient?",
      'cooking-tips': "Give me some Cameroonian cooking tips",
      'meal-plan': "Help me plan meals for the week",
    };

    const message = actionMessages[action];
    if (message) {
      sendMessage(message);
    }
  };

  const startVoiceInput = () => {
    setIsListening(true);
    
    // Simulate voice input - in real app, this would use speech-to-text
    Toast.show({
      type: 'info',
      text1: 'Voice Input',
      text2: 'Voice input will be available soon',
    });

    setTimeout(() => {
      setIsListening(false);
    }, 3000);
  };

  const renderMessage = (message: ChatMessage) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {!message.isUser && (
        <View style={styles.aiAvatar}>
          <Ionicons name="restaurant" size={16} color={Colors.light.primary} />
        </View>
      )}
      
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.aiBubble,
          message.type === 'recipe' && styles.recipeBubble,
          message.type === 'suggestion' && styles.suggestionBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.aiText,
          ]}
        >
          {message.text}
        </Text>
        
        {!message.isUser && message.type === 'recipe' && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Full Recipe</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {message.isUser && (
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={16} color="white" />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiHeaderAvatar}>
            <Ionicons name="restaurant" size={20} color={Colors.light.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Cooking Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {isProcessing ? 'Thinking...' : 'Online'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color={Colors.light.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}
        
        {isProcessing && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={styles.aiAvatar}>
              <Ionicons name="restaurant" size={16} color={Colors.light.primary} />
            </View>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Actions */}
      {showQuickActions && (
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickActionsList}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionCard}
                  onPress={() => handleQuickAction(action.action)}
                >
                  <Ionicons name={action.icon} size={24} color={Colors.light.primary} />
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionDescription}>{action.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask about Cameroonian cooking..."
            placeholderTextColor={Colors.light.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          
          <View style={styles.inputActions}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
                onPress={startVoiceInput}
              >
                <Ionicons 
                  name={isListening ? 'mic' : 'mic-outline'} 
                  size={20} 
                  color={isListening ? 'white' : Colors.light.primary} 
                />
              </TouchableOpacity>
            </Animated.View>
            
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ThemeConfig.spacing.md,
  },
  headerTitle: {
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
  },
  headerSubtitle: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.success,
  },
  helpButton: {
    padding: ThemeConfig.spacing.sm,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: ThemeConfig.spacing.lg,
    paddingBottom: ThemeConfig.spacing.xl,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: ThemeConfig.spacing.md,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ThemeConfig.spacing.sm,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: ThemeConfig.spacing.sm,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.sm,
    borderRadius: ThemeConfig.borderRadius.large,
  },
  userBubble: {
    backgroundColor: Colors.light.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.light.surface,
    borderBottomLeftRadius: 4,
  },
  recipeBubble: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.success,
  },
  suggestionBubble: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.info,
  },
  messageText: {
    fontSize: ThemeConfig.fontSize.md,
    lineHeight: 20,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: Colors.light.textPrimary,
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.sm,
    borderRadius: ThemeConfig.borderRadius.medium,
    marginTop: ThemeConfig.spacing.sm,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.sm,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ThemeConfig.spacing.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.textMuted,
    marginHorizontal: 2,
  },
  quickActionsContainer: {
    paddingVertical: ThemeConfig.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  quickActionsTitle: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.medium,
    color: Colors.light.textPrimary,
    paddingHorizontal: ThemeConfig.spacing.lg,
    marginBottom: ThemeConfig.spacing.sm,
  },
  quickActionsList: {
    flexDirection: 'row',
    paddingHorizontal: ThemeConfig.spacing.lg,
  },
  quickActionCard: {
    width: 120,
    backgroundColor: Colors.light.background,
    borderRadius: ThemeConfig.borderRadius.medium,
    padding: ThemeConfig.spacing.md,
    marginRight: ThemeConfig.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  quickActionTitle: {
    fontSize: ThemeConfig.fontSize.sm,
    fontWeight: ThemeConfig.fontWeight.medium,
    color: Colors.light.textPrimary,
    textAlign: 'center',
    marginTop: ThemeConfig.spacing.sm,
    marginBottom: ThemeConfig.spacing.xs,
  },
  quickActionDescription: {
    fontSize: ThemeConfig.fontSize.xs,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  inputContainer: {
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.light.surface,
    borderRadius: ThemeConfig.borderRadius.large,
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textInput: {
    flex: 1,
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textPrimary,
    maxHeight: 100,
    paddingVertical: ThemeConfig.spacing.sm,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: ThemeConfig.spacing.sm,
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ThemeConfig.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  voiceButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 