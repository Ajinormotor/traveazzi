import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import className from 'twrnc'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'


import apple from '../../assets/images/apple.png'
import google from '../../assets/images/google.png'
import AsyncStorage from '@react-native-async-storage/async-storage'
// import email from '../../assets/images/mail.png'


const Logins = () => {


  const router = useRouter()
  const {loading, login} = useAuthStore()
  
  const [email,setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  // const portalType =   user.role?.name ? user.role?.name : 'PASSENGER'


  
const handleSubmit = async () => {
  if (!email || !password) return;

  // login() persists session; the root layout guard handles role-based redirect
  const success = await login({ email, password });

  if (!success) {
    console.log("❌ Login failed");
    return;
  }

  setEmail("");
  setPassword("");
};






  return (
    <KeyboardAvoidingView 
    style={{flex: 1}} 
    
    behavior={Platform.OS === "ios" ? "padding" : "height"}>
     <View style={className`flex-1 p-2 bg-white`}>


<View style={className`flex flex-col gap-4 pt-8`}>

        <View style={className`flex flex-col gap-3`}>
    
     <TouchableOpacity  onPress={() => router.back()}>
        <Ionicons   name='arrow-back' size={20} color="black"
        />
     </TouchableOpacity>
{/* <Text style={className`text-[24px] font-bold`} > Log in</Text> */}
             
     </View>

     <View style={className`flex flex-col gap-4`}>
        
        
     <View style={className`flex flex-col `}>
       <Text style={className`text-[24px] font-bold`} > Login</Text>

        <Text style={className`text-[#AAAAAA] text-[12px]`}>
          Please fill in your information to create a new account </Text>
        </View>


<View style={className`flex flex-col gap-3`}>


<View style={className`flex flex-col gap-4`}>


{/* First Name */}
         <View 
style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px] 
          flex flex-row items-center p-1 gap-3`}>
            <TextInput
        placeholder='Email'
        style={className`w-[60%]`}
        value={email}
        onChangeText={setEmail}
        autoCapitalize='none'
        keyboardType='email-address'
             />

        </View>

              <View style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px] flex flex-row
                 items-center p-1 gap-3`}>
            <TextInput
            placeholder='Password'
            secureTextEntry
            autoCapitalize='none'
            style={className`w-[60%]`}
               value={password}
            onChangeText={setPassword}
            />



        </View>

    

        </View>


{/* No account */}
<View style={className`flex flex-row justify-between items-center`}>
  <Text style={className`text-[14px] font-medium`}>
    Don't have an account?{' '}
    <Text
      style={className`text-[#007BFF]`}
      onPress={() => router.push('/signup')}
    >
      Sign up
    </Text>
  </Text>
  <Text
    style={className`text-[12px] text-[#007BFF] underline`}
    onPress={() => router.push('/(auth)/forgotpassword')}
  >
    Forgot password?
  </Text>
</View>

      
        </View>

        <TouchableOpacity  onPress={ handleSubmit }
style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]  `}>
  {loading ?
<ActivityIndicator color="#fff" />
:
    <Text style={className`text-white text-[16px]`}>Login</Text>
  }
</TouchableOpacity>


     </View>

     {/* google,email */}

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
    <Text style={className`text-[#8C8C8C] underline`}>User Agreement</Text> and consent to the processing of my information in accordance with the{' '}
    <Text style={className`text-[#8C8C8C] underline`}>Privacy Policy.</Text>
  </Text>
</View>




    
     </View>

    </View>

    </KeyboardAvoidingView>
  )
}

export default Logins

const styles = StyleSheet.create({})