import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import className from 'twrnc'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import nigeria from "../../assets/images/Nigeria (NG).png"
import { Link } from 'expo-router'
import apple from '../../assets/images/apple.png'
import google from '../../assets/images/google.png'
import email from '../../assets/images/mail.png'


const Login = () => {
const route = useRouter()

  return (
     <View style={className`flex-1 p-2`}>


<View style={className`flex flex-col gap-4 pt-8`}>

        <View style={className`flex flex-col gap-3`}>
    
     <TouchableOpacity  onPress={() => route.back()}>
        <Ionicons   name='arrow-back' size={20} color="black"
        />
     </TouchableOpacity>
<Text style={className`text-[24px] font-bold`} > Log in</Text>
             
     </View>

     <View style={className`flex flex-col gap-4`}>
        
        
     <View style={className`flex flex-col `}>
        <Text style={className`text-[16px] font-bold`}> Enter your Phone Number </Text>
        <Text style={className`text-[#AAAAAA] text-[12px]`}> A confirmation code will be sent to it.</Text>
        </View>


<View style={className`flex flex-col gap-3`}>


        <View style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px] flex flex-row items-center p-1 gap-3`}>
           
            <Image source={nigeria}  alt=''
            style={className``}  />
       <Text>+234</Text>

            <TextInput  
            placeholder='00 0000 0000'
            maxLength={12}
            style={className`w-[60%]`}
            />

<Text style={className`text-black font-bold text-end`}>Paste</Text>


        </View>

<View style={className`flex flex-row `}>
<Text style={className`text-[14px] font-medium gap-1 flex flex-row`}>No account?  </Text>
<Link href="/signin/login" style={className`text-[#007BFF] text-[14px] `}>Create one</Link>
</View>
      
        </View>

        <TouchableOpacity onPress={() => route.push('/signin/loginOtp')}
style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]  `}>
    <Text style={className`text-white text-[16px]`}>Continue</Text>
</TouchableOpacity>

     </View>

     {/* google,email */}

     <View style={className`flex flex-col gap-[10px] w-full`}>

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

        <TouchableOpacity
        style={className`flex flex-row items-center justify-center bg-[#F6F6F6] 
        w-full h-[46px] rounded-[8px] py-1 gap-[10px]`}>
            <Image source={email} alt=''
            style={className`w-[20px] h-[20px]`}  />
            <Text style={className`text-[16px] text-black`}>Continue with Email</Text>
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
  )
}

export default Login

const styles = StyleSheet.create({})