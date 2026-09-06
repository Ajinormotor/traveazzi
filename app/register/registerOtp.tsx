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
;
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { usePhoneNumberStore } from '../../store/phoneNumberStore';

const RegisterOtp = () => {
  const route = useRouter();
  const { phoneNumber } = usePhoneNumberStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
    const countdown = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(countdown);
  }, [timer]);

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

  const handleContinue = async () => {
    // Validate all 6 digits are entered
    if (otp.some((digit) => digit === '')) {
      Toast.show({
        type: 'error',
        text1: 'OTP Error',
        text2: 'Please enter all 6 digits of the code.',
      });
      return;
    }

    console.log("Otp code:", otp)
    const fullOtp = otp.join('');

    try {
      const response = await axios.post(
        'https://traveazi.onrender.com/api/auth/phone/verify-otp',
        {
          phoneNumber: `+234${phoneNumber.replace(/^0/, '')}`,
          otp: fullOtp,
        }
      );

     
      setError(false);

      if(response?.data?.success){
        Toast.show({
          type: 'success',
          text1: 'OTP Valid',
   
        });
      }
   
      route.push('/(auth)/signup');
    } catch (error: any) {
      setError(true);
      const errorMessage =
        error?.response?.data?.message || 'Something went wrong.';

      Toast.show({
        type: 'error',
        text1: 'OTP Error',
        text2: errorMessage,
      });

      console.log(errorMessage);
    }
  };

  return (
    <>
  
    <View style={className`flex-1 p-2`}>
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
              Enter the 6-digit code sent to you at {phoneNumber}
            </Text>
            <Text style={className`text-[#AAAAAA] text-[12px]`}>
              A confirmation code was sent to the above listed Phone Number.
            </Text>
          </View>

          {/* OTP Inputs */}
          <View
            style={className`flex flex-row items-center justify-between w-full`}
          >
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
          <View style={className`flex flex-row gap-1 items-center`}>
            <Text style={className`text-[14px] font-medium underline`}>
              Didn't get code?
            </Text>

            
          {/* Countdown + Options */}
          <View style={className`flex flex-row gap-2`}>
            <View
              style={className`bg-[#F6F6F6] max-w-[146px] w-full h-[29px] rounded-[30px] flex flex-row items-center justify-center`}
            >
              <Text style={className`text-[#969696] text-[14px]`}>
                Resend
              </Text>
              <Text style={className`text-[#969696] text-[14px]`}>
                {' '}
                ({timer}s)
              </Text>
            </View>

          
          </View>
          </View>


          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]`}
          >
            <Text style={className`text-white text-[16px]`}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>


    <Toast />

    </>
  );
};

export default RegisterOtp;

const styles = StyleSheet.create({});
