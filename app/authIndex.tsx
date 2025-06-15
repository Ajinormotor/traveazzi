import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import className from 'twrnc'
import Ionicons from '@expo/vector-icons/Ionicons'
import nigeria from "../assets/images/Nigeria (NG).png"

import { Link } from 'expo-router'

import apple from '../assets/images/apple.png'
import google from '../assets/images/google.png'
import email from '../assets/images/mail.png'
import { useRouter } from 'expo-router'
import axios from 'axios'

import Toast from 'react-native-toast-message';
import { usePhoneNumberStore } from '../store/phoneNumberStore'




const AuthIndex = () => {
  
  const router = useRouter();
  const { setPhoneNumber } = usePhoneNumberStore();

  const [contact, setContact] = useState('');
  const [error, setError] = useState(false);

  const handleContinue = async () => {
    if (contact.trim().length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number',
        text2: 'Please enter a valid Nigerian number.',
      });
      setError(true);
      return;
    }
  
    try {
      const response = await axios.post('https://traveazi.onrender.com/api/auth/phone/send-otp', {
        phoneNumber: `+234${contact.replace(/^0/, '')}`,
      });
  
      // Extract and check response data
      if (response?.data?.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: response.data.data?.message || response.data.message,
        });
      }
  
        setError(false);
        setPhoneNumber(contact); // Save to store
        router.push('/home'); 
        console.log("PhoneNumber:", contact)
    
      
    } catch (error: any) {
      setError(true);
  
      const errorMessage =
        error?.response?.data?.message || 'Unable to send OTP. Please try again.';
  
      Toast.show({
        type: 'error',
        text1: 'OTP Error',
        text2: errorMessage,
      });
  
      console.error(error);
    }
  };
  

  return (
    <>
      <View style={className`flex-1 p-2`}>
        <View style={className`flex flex-col gap-4 pt-8`}>
          <View style={className`flex flex-col gap-3`}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="black" />
            </TouchableOpacity>
            {/* <Text style={className`text-[24px] font-bold`}>Sign Up</Text> */}
          </View>

          <View style={className`flex flex-col gap-4`}>
            <View style={className`flex flex-col`}>
              <Text style={className`text-[16px] font-bold`}>Enter your Phone Number</Text>
              <Text style={className`text-[#AAAAAA] text-[12px]`}>
                A confirmation code will be sent to it.
              </Text>
            </View>

            <View style={className`flex flex-col gap-3`}>
              <View
                style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px] flex flex-row items-center p-1 gap-3`}>
                <Image source={nigeria} style={className``} />
                <Text>+234</Text>
                <TextInput
                  placeholder="0000000000"
                  keyboardType="numeric"
                  maxLength={11}
                  value={contact}
                  onChangeText={setContact}
                  style={className`w-[60%]`}
                />
                <Text style={className`text-black font-bold text-end`}>Paste</Text>
              </View>
{/* 
              <View style={className`flex flex-row`}>
                <Text style={className`text-[14px] font-medium`}>Already have an account? </Text>
                <Link href="/signin/login" style={className`text-[#007BFF] text-[14px]`}>
                  Log in
                </Link>
              </View> */}

            </View>

            <TouchableOpacity
              onPress={() =>router.push('/home')}
              style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]`}>
              <Text style={className`text-white text-[16px]`}>Continue</Text>
            </TouchableOpacity>
          </View>

          {/* Continue with Apple / Google / Email */}
          <View style={className`flex flex-col gap-[10px] w-full`}>
            <TouchableOpacity
              style={className`flex flex-row items-center justify-center bg-[#F6F6F6] 
              w-full h-[46px] rounded-[8px] py-1 gap-[10px]`}>
              <Image source={apple} style={className`w-[20px] h-[20px]`} />
              <Text style={className`text-[16px] text-black`}>Continue with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={className`flex flex-row items-center justify-center bg-[#F6F6F6] 
              w-full h-[46px] rounded-[8px] py-1 gap-[10px]`}>
              <Image source={google} style={className`w-[20px] h-[20px]`} />
              <Text style={className`text-[16px] text-black`}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={className`flex flex-row items-center justify-center bg-[#F6F6F6] 
              w-full h-[46px] rounded-[8px] py-1 gap-[10px]`}>
              <Image source={email} style={className`w-[20px] h-[20px]`} />
              <Text style={className`text-[16px] text-black`}>Continue with Email</Text>
            </TouchableOpacity>
          </View>

          {/* Terms and Privacy */}
          <View>
            <Text style={className`text-[12px]`}>
              By proceeding, I acknowledge that I have read and agree to the terms of the{' '}
              <Text style={className`text-[#8C8C8C] underline`}>User Agreement</Text> and consent to the processing of my information in accordance with the{' '}
              <Text style={className`text-[#8C8C8C] underline`}>Privacy Policy.</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Toast Message Component */}
      <Toast />
    </>
  );
};

export default AuthIndex;

const styles = StyleSheet.create({});