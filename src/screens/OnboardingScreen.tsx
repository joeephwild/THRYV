import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StatusBar,
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  ImageBackground,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { completeOnboarding } from '../store/slices/onboardingSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any;
  textPosition: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right';
  textColor: string;
  gradientColors: [string, string, string]; // Properly typed as a tuple with 3 elements
}

const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  
  const slides: OnboardingSlide[] = [
    {
      id: '1',
      title: 'Take Control of Your Finances',
      description: 'Smart budgeting and spending insights tailored for Gen Z',
      image: require('../assets/images/onboard1.jpg'),
      textPosition: 'top-left',
      textColor: '#FFD700', // Gold
      gradientColors: ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent'],
    },
    {
      id: '2',
      title: 'Earn While You Learn',
      description: 'Complete financial challenges and earn rewards',
      image: require('../assets/images/onboard2.jpg'),
      textPosition: 'bottom-right',
      textColor: '#00FF87', // Neon Green
      gradientColors: ['transparent', 'rgba(0,0,0,0.5)', 'transparent'],
    },
    {
      id: '3',
      title: 'Your Money, Your Way',
      description: 'Personalized financial tools for your unique journey',
      image: require('../assets/images/onboard3.jpg'),
      textPosition: 'bottom-left',
      textColor: '#FF69B4', // Hot Pink
      gradientColors: ['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)'],
    },
    {
      id: '4',
      title: 'Community Spirited',
      description: 'Connect with like-minded individuals and share your journey',
      image: require('../assets/images/onboard4.jpg'),
      textPosition: 'center',
      textColor: '#FF6F61', // Hot Pink
      gradientColors: ['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)'],
    },
  ];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
      scrollViewRef.current?.scrollTo({
        x: width * (currentIndex + 1),
        animated: true
      });
    } else {
      dispatch(completeOnboarding());
      router.replace('/welcome');
    }
  };

  const handleSkip = () => {
    dispatch(completeOnboarding());
    router.replace('/welcome');
  };

  return (
    <View className="flex-1 bg-black"> 
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {slides.map((slide) => (
          <Animated.View 
            key={slide.id}
            entering={FadeIn.duration(800)}
            style={{ width, height }}
            className="relative"
          >
            <ImageBackground
              source={slide.image}
              style={{
                width,
                height,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              resizeMode="cover"
            >
              
              <Animated.View 
                entering={FadeInRight.duration(1000).delay(300)}
                className="absolute"
                style={[{
                  width: '100%'
                }, getTextPositionStyle(slide.textPosition, insets)]}
              >
                <Text 
                  className="text-[52px] font-extrabold font-boxing leading-[0.79em] mb-4"
                  style={{
                    color: slide.textColor,
                    textShadowColor: 'rgba(0,0,0,0.75)',
                    textShadowOffset: { width: 2, height: 2 },
                    textShadowRadius: 5,
                    textAlign: slide.textPosition === 'center' ? 'center' : 
                             slide.textPosition.includes('right') ? 'right' : 'left'
                  }}
                >
                  {slide.title}
                </Text>
              </Animated.View>
            </ImageBackground>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Skip button */}
      <TouchableOpacity 
        className="absolute top-0 right-0 p-5 z-10"
        style={{ marginTop: insets.top + 10 }}
        onPress={handleSkip}
      >
        <Text className="text-white text-base font-cabinet-medium">
          Skip
        </Text>
      </TouchableOpacity>

      {/* Bottom controls */}
      <View 
        className="absolute bottom-0 left-0 right-0 px-6 bg-transparent"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <View className="flex-row justify-center mb-6">
          {slides.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full mx-1.5 ${i === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
            />
          ))}
        </View>

        <TouchableOpacity 
          className="bg-white py-4 rounded-[30px] items-center shadow-lg"
          style={styles.button}
          onPress={handleNext}
        >
          <Text className="text-[#FF8A3D] text-lg font-cabinet-bold">
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};



// Helper function to determine text position styles
function getTextPositionStyle(position: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right', insets: any) {
  switch (position) {
    case 'top-left':
      return { top: insets.top + 90, left: 10 };
    case 'top-right':
      return { top: insets.top + 80, right: 10 };
    case 'center':
      return { top: height * 0.43, left: 10, right: 40 };
    case 'bottom-left':
      return { bottom: insets.bottom + 150, left: 20 };
    case 'bottom-right':
      return { bottom: insets.bottom + 150, right: 20 };
    default:
      return { top: height * 0.33, left: 40, right: 40 };
  }
}

const styles = StyleSheet.create({
  button: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  }
});

export default OnboardingScreen;
