import { Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import className from 'twrnc'
import bg from "../../assets/images/map_bg.png"
// import  Ionicons from "@expo/vector-icons/Ionicons"
// import down from "../assets/images/down.png"
// import receipt from "../assets/images/reciept.png"
// import user from "../assets/images/user.png"
// import courier from "../assets/images/package.png"
// import calener from "../assets/images/calendar-03.png"
// import no_trip from "../assets/images/no_trip.png"
import marker from "../../assets/images/marker.png"
import directions from "../../assets/images/navigation-03.png"
// import indicator from "../assets/images/indicator.png"
import Search from '@/components/Search'


const PassengerIndex = () => {
    const [showSearch, setShowSearch] = useState<boolean | null>(true);

  return (
    <ImageBackground
    source={bg} alt=''
    style={className`flex-1 `}
    >
<View style={className`h-1/2 relative `}>

<TouchableOpacity style={className`absolute left-[50px] bottom-[50px]`} >
<Image source={marker}  alt='' style={className`w-[100px] h-[100px]`}   />
</TouchableOpacity>

<TouchableOpacity 
style={className`absolute right-[30px] bottom-[20px]`}>

    <View style={className` w-[40px] h-[40px]  rounded-full bg-white flex flex-row items-center
         justify-center border-[1px] border-[#F0F0F0]`}>
    <Image source={directions}  alt='' style={className`w-[20px] h-[20px]`}   />
    </View>

</TouchableOpacity>

</View>


<ScrollView  
 showsVerticalScrollIndicator
style={className`h-1/2 bg-white flex-col  rounded-t-[30px] py-4 px-3 gap-7`}  >
    
    <View>
            <Search   />
        </View>
   </ScrollView>
    
    </ImageBackground>
  )
}

export default PassengerIndex

const styles = StyleSheet.create({})