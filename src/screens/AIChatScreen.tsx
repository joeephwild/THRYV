import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme'; // You might be able to remove these if not used elsewhere after conversion

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AIChatScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi there! I\'m your friendly financial guru. How can I help you understand your spending habits, plan your savings goals, or answer your questions today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');

    setTimeout(() => {
      const aiResponses = [
        "Based on your spending this month, you've spent over $500, but you spent $602 last month. You're doing better!",
        "It looks like you won't have any money left until 23 April 😱",
        "I can help you compare your monthly expenses and create a savings plan. Would you like me to do that?",
        "Your biggest expense categories are food, transportation, and entertainment. Would you like some tips on how to reduce spending in these areas?"
      ];

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    }, 1000);
  };

  const renderMessage = (message: Message) => {
    return (
      <View
        key={message.id}
        className={`max-w-[80%] border-b-8 border-l-4 border-r-2 border-t-2 border-[#0A0B0F] p-3 rounded-2xl mb-3 ${message.isUser ? 'bg-blue-600 self-end rounded-br-md' : 'bg-yellow-400 self-start rounded-bl-md'}`}
      >
        <Text className="text-base text-black">{message.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
        <Text className="text-lg font-bold text-black">AI Assistant</Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          className="flex-1 p-4"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 8 }}
        >
          {messages.map(renderMessage)}
        </ScrollView>

        <View className="flex-row p-3 bg-white border-t border-gray-200">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 max-h-24 text-base"
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.darkGray} // Consider replacing with Tailwind placeholder color if available
            multiline
          />
          <TouchableOpacity
            className={`ml-3 bg-blue-600 rounded-full px-4 justify-center items-center ${inputText.trim() === '' ? 'opacity-50' : ''}`}
            onPress={handleSend}
            disabled={inputText.trim() === ''}
          >
            <Text className="text-white font-semibold text-base">Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AIChatScreen;
