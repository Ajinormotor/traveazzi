import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet,
     Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import bg from "../../assets/images/map_bg.png"
import className, { style } from 'twrnc'
import marker from "../../assets/images/marker.png"
import down from "../../assets/images/down.png"
import indicator from "../../assets/images/indicator.png"
import cancel from "../../assets/images/cancel.png"
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'

import downArrow from "../../assets/images/down_arrow.png"
import up from "../../assets/images/up.png"



const StartRide = () => {
const router = useRouter()
const { width } = Dimensions.get('window');

const handleSubmit = () => {
    router.push('/manageRide')
}

  return (
<ImageBackground
  source={bg}
  alt=""
  style={[className`flex-1`, { width }]}
>


        <View style={className`h-[20%] relative `}>

<TouchableOpacity style={className`absolute left-[50px] bottom-[50px]`} >
<Image source={marker}  alt='' style={className`w-[100px] h-[100px]`}   />
</TouchableOpacity>
</View>

    <View style={[className`flex-1 flex flex-col gap-3 bg-white p-3 h-[80%]`,
        {width}
    ]}>

      
<ScrollView  
showsVerticalScrollIndicator={false}
showsHorizontalScrollIndicator={false}
style={className`flex flex-col gap-3  `}>

   <TouchableOpacity style={className`w-full flex flex-row items-center justify-center`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>





<View  style={className` flex flex-col gap-4`}>


     <View style={className`flex flex-row items-start justify-between`}>

      <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-2xl  font-bold`}>Manage ride</Text>
        <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>Manage your trip and requests.</Text>
      </View>

    <TouchableOpacity>
      <Image source={cancel} alt='' style={className`w-[20px] h-[20px]`   }  />
    </TouchableOpacity>

     </View>


  
  <View style={className`flex flex-col gap-4  `}>

{/* Ride details */}
        <View style={className`px-2`} >
        
        <Text style={className`text-black font-bold text-base`}>Ride Details</Text>

                <View  style={className`flex flex-col bg-white  `}>
        
            
                <View style={className`flex flex-row 
                 items-center justify-between gap-[10px] w-full  px-2`}>
        
        <View style={className`flex flex-col gap-1 py-4`}>
        
        <View style={className`flex flex-row gap-1`}>
            <Image source={up}  alt=""
            style={className``}  />
            <Text style={className`text-[14px] font-bold`}>Ph, Rivers</Text>
        </View>
        
        <Text style={className`text-[12px] font-bold text-[#434343]`}>Legend Hotel Rivers Airport</Text>
        </View>
        
      
        
        
                </View>

                </View>


{/* Seperator with time */}
                <View style={className`flex flex-row items-center  gap-2 px-2`}>
                  <Text style={className`text-[#8C8C8C] text-sm`}>25th May 2025</Text>
                  <View style={className`w-full border-[#ECECEC] border-[2px] w-[45%] h-[2px]`}></View>
                  <Text style={className`text-[#008000] text-sm font-bold`}>#25,000.00</Text>
                </View>

                 <View  style={className`flex flex-col bg-white  `}>
        
            
                <View style={className`flex flex-row 
                 items-center justify-between gap-[10px] w-full  px-2`}>
        
        <View style={className`flex flex-col gap-1 py-4`}>
        
        <View style={className`flex flex-row gap-1`}>
            <Image source={downArrow}  alt=""
            style={className``}  />
            <Text style={className`text-[14px] font-bold`}>Ikeja, Lagos</Text>
        </View>
        
        <Text style={className`text-[12px] font-bold text-[#434343]`}>Legend Hotel Lagos Airport, Curio collection</Text>
        </View>
        
       
        
                </View>
       
        
    
             
        
                </View>
      
        </View>

        

  <View style={className`flex flex-col gap-2`}>

    <View className='flex flex-col gap-4'>
      {
        users.map((user,index) => (
          <View key={index} style={className`flex flex-row items-center justify-between py-2`}>

            <View style={className`flex flex-row gap-3 items-center`}>
            <Image source={user.image}  
            style={className`rounded-full w-10 h-10`} />
              <Text style={className`font-bold text-sm`}>{user.name}</Text>

            </View>


            <View style={className`flex flex-row gap-2 items-center`}>
{/* Reject button */}
              <View style={className`flex flex-row items-center justify-center bg-[#DC3545] w-[71px] h-[35px] rounded-[8px]`}>
                <Text  style={className`text-white text-sm font-bold`}>Reject</Text>
              </View>

                   <View style={className`flex flex-row items-center justify-center bg-[#28A745] w-[71px] h-[35px] rounded-[8px]`}>
                <Text  style={className`text-white text-sm font-bold`}>Accept</Text>
              </View>

            </View>


          </View>
        ))
      }


    </View>

  </View>

{/* button */}

<View style={className`flex flex-col gap-2`}>

      {/* Button */}
  <View style={className`w-full flex items-center justify-center`}>
    <TouchableOpacity onPress={handleSubmit}
      style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]`}>
      <Text style={className`text-white text-[16px]`}>Offer Ride</Text>
    </TouchableOpacity>
  </View>

        {/* Button */}
  <View style={className`w-full flex items-center justify-center`}>
    <TouchableOpacity onPress={() => router.back()}
      style={className`w-full h-[46px] bg-[#F0F0F0] flex items-center justify-center rounded-[6px]`}>
      <Text style={className`text-[#FF0000] text-[16px]`}>Cancel Offer</Text>
    </TouchableOpacity>
  </View>


    
</View>

</View>

 

     </View>

    </ScrollView>

    </View>

    </ImageBackground>
  )
}

export default StartRide


import user from "../../assets/images/user.png"

const users = [
  {
    name: "Alice Johnson",
    image: user
  },
  {
    name: "Brian Smith",
   image: user
  },
  {
    name: "Cynthia Lee",
  image: user
  },

];
