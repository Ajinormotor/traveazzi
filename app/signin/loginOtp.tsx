import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
  } from 'react-native';
  import React, { useRef, useState, useEffect } from 'react';
  import className from 'twrnc';
  import Ionicons from '@expo/vector-icons/Ionicons';
  import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import Toast from 'react-native-toast-message';
import { ActivityIndicator } from 'react-native';
  
  const LoginOtp = () => {
    const route = useRouter();
  
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
  
    // Refs to control input focus
    const inputs = useRef<Array<TextInput | null>>([]);

    const { userEmail, registerMailOtp, registerMail, loading } = useAuthStore()
  
    useEffect(() => {
      if (timer <= 0) return;
  
      const countdown = setInterval(() => {
        setTimer((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
  
      return () => clearInterval(countdown);
    }, [timer]);

    const handleResend = async () => {
      if (timer > 0 || !userEmail) return;
      setTimer(60);
      await registerMail(userEmail);
    };
  
    const handleChange = (text: string, index: number) => {
      if (/^\d$/.test(text)) {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
  
        if (index < 5) {
          inputs.current[index + 1]?.focus();
        }
      } else if (text === '') {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    };

    const handleSubmit = async() => {
      if (loading) return;
      const code = otp.join('');

      if (code.length < 6) {
        Toast.show({ type: 'error', text1: 'Enter the full 6-digit code' });
        return;
      }

      const verified = await registerMailOtp(code, userEmail ?? undefined);

      if (verified) {
        route.push('/(auth)/signup');
      }
    }
  
    return (
      <View style={className`flex-1 p-2 bg-white`}>
        <View style={className`flex flex-col gap-7 pt-8`}>
          {/* Header */}
          <View style={className`flex flex-col gap-3`}>
            <TouchableOpacity onPress={() => route.back()}>
              <Ionicons name="arrow-back" size={20} color="black" />
            </TouchableOpacity>
            <Text style={className`text-[24px] font-bold`}>Sign Up</Text>
          </View>
  
          {/* Instruction */}
          <View style={className`flex flex-col gap-4`}>
            <View style={className`flex flex-col`}>
              <Text style={className`text-[16px] font-bold`}>
                Enter the 6-digit code sent to you at {userEmail}
              </Text>
              <Text style={className`text-[#AAAAAA] text-[12px]`}>
                A confirmation code was sent to the above listed email.
              </Text>
            </View>
  
            {/* OTP Inputs */}
            <View style={className`flex flex-row items-center justify-between w-full`}>
              {[...Array(6)].map((_, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputs.current[index] = ref;
                  }}
                  style={className`w-[46px] h-[46px] rounded-[8px] bg-[#F0F0F0] text-center text-[18px]`}
                  keyboardType="numeric"
                  maxLength={1}
                  onChangeText={(text) => handleChange(text, index)}
                  value={otp[index]}
                />
              ))}
            </View>
  
            {/* Didn't get code */}
            <View style={className`flex flex-row`}>
              <Text style={className`text-[14px] font-medium underline`}>
                Didn't get code?
              </Text>
            </View>
  
            {/* Countdown + Options */}
            <View style={className`flex flex-row gap-2`}>
              <TouchableOpacity
                onPress={handleResend}
                disabled={timer > 0 || loading}
                style={className`bg-[#F6F6F6] max-w-[146px] w-full h-[29px] rounded-[30px] flex flex-row items-center justify-center ${timer > 0 ? 'opacity-60' : ''}`}
              >
                <Text style={className`text-[#969696] text-[14px]`}>
                  Resend
                </Text>
                <Text style={className`text-[#969696] text-[14px]`}>
                  {' '}
                  ({timer}s)
                </Text>
              </TouchableOpacity>
  
              <View
                style={className`bg-[#F6F6F6] max-w-[146px] w-full h-[29px] rounded-[30px] flex flex-row items-center justify-center`}
              >
                <Text style={className`text-[#969696] text-[14px]`}>
                  Call me with a code
                </Text>
              </View>
            </View>
  
            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleSubmit }
              disabled={loading}
              style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px] ${loading ? 'opacity-60' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={className`text-white text-[16px]`}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  
  export default LoginOtp;
  
  const styles = StyleSheet.create({});
  