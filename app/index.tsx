import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import className from 'twrnc'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { Link } from 'expo-router'

import apple from '../assets/images/apple.png'
import google from '../assets/images/google.png'
import email from '../assets/images/mail.png'
import { useAuthStore } from '@/store/authStore'
// import Toast from 'react-native-toast-message'
import { ActivityIndicator } from 'react-native'
import Toast from 'react-native-toast-message'

const Homeindex = () => {

  const [ email, setEmail] = useState<string >('')
const route = useRouter()

const { registerMail, loading} = useAuthStore()

const handleSubmit = async () => {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    Toast.show({
      type: 'error',
      text1: 'Enter a valid email address',
    });
    return;
  }

  const success = await registerMail(email);
  if (success) {
            Toast.show({
              type: 'success',
              text1: 'OTP Sent',
              // text2: response.data.data?.message || response.data.message,
            });
    route.push('/signin/loginOtp');
  }


  //  route.push('/signin/loginOtp')

};

  return (
    <KeyboardAvoidingView
    style={{flex: 1}}
    behavior={Platform.OS === "ios" ? "padding" :  "height"}
    >

 
     <View style={className`flex-1 p-2 bg-white`}>


<View style={className`flex flex-col gap-4 pt-8`}>


     <View style={className`flex flex-col gap-4`}>
        
        
     <View style={className`flex flex-col `}>
       <Text style={className`text-[24px] font-bold`} > Sign Up</Text>

        <Text style={className`text-[#AAAAAA] text-[12px]`}>Enter your credentials to access 
          your account </Text>
        </View>


<View style={className`flex flex-col gap-3`}>


<View style={className`flex flex-col gap-4`}>


        <View style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px] flex flex-row items-center p-1 gap-3`}>
        


            <TextInput  
            placeholder='Email'
            style={className`w-[60%]`}
            value={email}
   onChangeText={(text) => setEmail(text)} 
       keyboardType='email-address' autoCapitalize='none'
            />
        </View>




        </View>


      
        </View>
        {/* No account */}
<View style={className`flex flex-row `}>
<Text style={className`text-[14px] font-medium gap-1 flex flex-row`}> 
  Already have an account?  </Text>

<TouchableOpacity onPress={() => route.push('/(auth)')}
>
  <Text style={className`text-[#007BFF] text-[14px] `}>Login</Text>

</TouchableOpacity>
</View>

        <TouchableOpacity  onPress={ handleSubmit }
style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]  `}>
  {loading ?
<ActivityIndicator color="#fff" />
:
    <Text style={className`text-white text-[16px]`}>Sign up</Text>
  }
</TouchableOpacity>

     </View>

{/* Seperator */}
     <View style={className`hidden flex-row items-center gap-2`}>

      <View style={className`bg-gray-300 h-[2px] max-w-[45%] w-full` }></View>

    <Text> Or</Text>

   <View style={className`bg-gray-300 h-[2px] max-w-[45%]  w-full`}></View>

     </View>

     {/* google,email */}

     <View style={className`hidden flex-col gap-[10px] w-full`}>

        <TouchableOpacity
        style={className`flex flex-row items-center justify-center bg-[#F6F6F6] 
        w-full h-[46px] rounded-[8px] py-1 gap-[10px]`}>
            <Image source={apple} alt=''
            style={className`w-[20px] h-[20px]`}  />
            <Text style={className`text-[16px] text-black`}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={className`flex flex-row items-center justify-center bg-[#F6F6F6] 
        w-full h-[46px] rounded-[8px] py-1 gap-[10px]`}>
            <Image source={google} alt=''
            style={className`w-[20px] h-[20px]`}  />
            <Text style={className`text-[16px] text-black`}>Continue with Google</Text>
        </TouchableOpacity>



     </View>


{/* Text */}
 <View>
  <Text style={className`text-[12px]`}>
    By proceeding, I acknowledge that I have read and agree to the terms of the{' '}
    <Text style={className`text-[#8C8C8C] underline`}>
      User Agreement</Text> and consent to the
       processing of my information in accordance with the{' '}
    <Text style={className`text-[#8C8C8C] underline`}>Privacy Policy.</Text>
  </Text>
</View>

    
     </View>

    </View>

       </KeyboardAvoidingView>
  )
  
}

export default Homeindex

const styles = StyleSheet.create({})






        {/* <View style={className`flex flex-col gap-3`}>
    
     <TouchableOpacity  onPress={() => route.back()}>
        <Ionicons   name='arrow-back' size={20} color="black"
        />
     </TouchableOpacity>
<Text style={className`text-[24px] font-bold`} > Log in</Text>
             
     </View> */}


        {/* <View style={className`flex flex-row items-center justify-between`}>
       

<View style={className`flex flex-row `}>
<Text style={className`text-[14px] font-medium gap-1 flex flex-row`}> Dont have an account?  </Text>

<TouchableOpacity onPress={() => route.push('/(auth)/signup')} 
>
 <Text style={className`text-[#007BFF] text-[14px] `}>Sign up </Text>
</TouchableOpacity>

</View>

<TouchableOpacity onPress={() => route.push('/(auth)/forgotpassword')} 
>
 <Text style={className`text-[#007BFF] text-[14px] `}>Forgot password? </Text>
</TouchableOpacity>

 </View> */}



 
        {/* <TouchableOpacity
        style={className`flex flex-row items-center justify-center bg-[#F6F6F6] 
        w-full h-[46px] rounded-[8px] py-1 gap-[10px]`}>
            <Image source={email} alt=''
            style={className`w-[20px] h-[20px]`}  />
            <Text style={className`text-[16px] text-black`}>Continue with Email</Text>
        </TouchableOpacity> */}



        {/* 
              <View style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px] flex flex-row items-center p-1 gap-3`}>
            <TextInput  
            placeholder='Password'
            maxLength={12}
            style={className`w-[60%]`}
            />



        </View> */}