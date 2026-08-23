import { Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput,
     TouchableOpacity, View } from  'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { riderListData } from '@/constants/data/riderList'
import className, { style } from 'twrnc'

import transit_bg from "../../assets/images/bg_map_ongoing.png"
import indicator from "../../assets/images/indicator.png"
import distanceIcon from "../../assets/images/Flash-Fast-Speed--Streamline-Core.png.png"
import i from "../../assets/images/i.png"
import green_gps from "../../assets/images/green_gps.png"
import transit_car from "../../assets/images/car_9855634 1.png"
import down from "../../assets/images/down.png"
import { LinearGradient } from 'expo-linear-gradient'
import Ionicons from '@expo/vector-icons/Ionicons'



const emoji = [
  { icon: '😁', label: 'Great' },
  { icon: '😃', label: 'Good' },
  { icon: '😐', label: 'Okay' },
  { icon: '😖', label: 'Terrible' },
  { icon: '😞', label: 'Poor' },
];


const ConfirmRide = () => {
    const route = useRouter()

const {id} = useLocalSearchParams()
// const route = useRouter()

const item = riderListData.find(item => item.id === id)

const [showReport, setShowReport] = useState<Boolean >(false)


console.log('item',item)

  return (
    <ImageBackground
    source={transit_bg} alt=''
    style={className`flex-1 `}
    >


<View style={className`h-[30%] relative `}>


</View>

<View 
style={className`h-[70%] bg-[#FAFAFA]  flex-col  rounded-t-[30px]  gap-2`}  >
    <ScrollView
showsVerticalScrollIndicator={false}
style={className`flex flex-col gap-3`}
>


{/* upper */}
    <View style={className`bg-white px-2 flex flex-col gap-[10px]`}>

  
<TouchableOpacity style={className`w-full flex flex-row items-center pt-2 justify-center`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>


<View style={className`flex flex-col gap-[10px] b py-3 `}>

<View style={className`flex flex-col gap-[10px]`}>

    <View style={className`flex flex-row gap-[10px]`}>
        <Image source={distanceIcon} alt=''
        style={className`w-[24px] h-[24px]`  }  />
        <Text style={className`flex flex-row gap-1 text-[18px]`}>
            <Text style={className`font-bold text-[#000000]`} >You've Arrived!</Text>
            
        </Text>
    </View>

<View style={className`flex flex-row items-center gap-1 `}>

<Text style={className`font-bold text-[#AAAAAA] text-[14px]`}>5th May 2025</Text>
<Text style={className`font-bold text-[#AAAAAA] text-[14px]`}> 6:19PM </Text>

{/* <View style={className`bg-[#F8FFFC] w-[103px] h-[30px] flex items-center justify-center text-center
  `}>
  <Text style={className`text-[#00B964] text-[16px] font-bold`}>   {item?.location_details?.[0]?.time}
  </Text>

</View> */}

</View>
  

    </View>


{/* Linear gradient */}
    <View style={className`flex flex-row items-center gap-[10px] h-[32px] w-full px-2 bg-[#FAFAFA] rounded-[4px]`}>

        <View style={className`flex flex-row gap-[10px] w-[95%] items-center `}>
            <LinearGradient
            colors={['#D3D3D3', '#000000']}
            style={className` h-[6px] w-[30%]`}
            >
            </LinearGradient>

        <Image source={transit_car} alt=''
            style={className`w-[24px] h-[16px]`} />
               <View style={className`bg-[#00B964] h-[6px]  w-[55%] rounded-[1px]`}></View>

 </View>

        <View style={className`w-[5%]`}>
            <Image source={green_gps} alt=''
            style={className`w-[16px] h-[16px]`} />
        </View>

       
    </View>


{/* Trip Summary */}
<View>
    <Text style={className`text-black text-[15px]`}>Trip Summary</Text>
</View>


{/* location details */}
   <View style={className``} >
        
        
        {
            item?.location_details.map((location) => (
                <View key={location.id } style={className`flex flex-col bg-white  `}>
        
            
                <View style={className`flex flex-row 
                 items-center justify-between gap-[5px] w-full  p-3`}>
        
        <View style={className`flex flex-col gap-1 py-2`}>
        
        <View style={className`flex flex-row gap-1`}>
            <Image source={location.image}  alt=""
            style={className``}  />
            <Text style={className`text-[14px] font-bold`}>{location.first_location}</Text>
        </View>
        
        <Text style={className`text-[12px] font-bold text-[#434343]`}>{location.first_direction}</Text>
        </View>
        
        {/* <View style={className`w-[51px] h-[22px] rounded-lg flex items-center justify-center 
            bg-[#F0F0F0]`}>
            <Text style={className`font-bold text-[12px] text-[#AAAAAA]`}>Edit</Text>
        </View>
         */}
        
                </View>
       
   { location?.arrow &&     
    <View style={className`rounded-lg flex flex-row items-center justify-center
             h-[32px] w-full mx-3 gap-3 `}>
      <Image source={location?.arrow} alt=''
      className='w-4 h-4' />
      <View style={className`w-full max-w-[90%]  border-[#ECECEC] border-[1px] `}>

      </View>
            </View>

        }
    
             
        
                </View>
            ))
        }
        
        </View>

</View>

</View>

{/* Lower  */}
   <View  style={className`flex flex-col gap-2  py-3 bg-white px-2 `}>

<View style={className`flex flex-col gap-[10px] bg-white`} > 

                    <View style={className`flex flex-row items-center justify-between`}>

                      <View style={className`w-[101px] h-[31px] bg-[#F7F7F7] rounded-[5px] p-1 flex  font-bold
                            flex-row items-center justify-center`}>
                            <Text>{item?.plate_no}</Text>
                        </View>

                      

                    </View>

                    <View style={className`border-[1px] border-[#F6F5F5] w-full`}>
                        
                    </View>

                   <View style={className`flex flex-col `}>

<View style={className`flex flex-row gap-1`}>

    <View>

    <Image source={item?.image} alt=''
    className='w-[50px] h-[50px] rounded-full'  />
    </View>
    <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-sm font-bold text-black`}> {item?.rider_name} </Text>
        <Text style={className`font-bold text-[12px]  text-[#A1A1A1]`}> {item?.vehicle} </Text>
    </View>

</View>

  <View>
                 <Text style={className`text-2xl text-[#008000] font-bold`}>₦{item?.price}</Text>
                        </View>


                    </View>

                    <View style={className`border-[1px] border-[#F6F5F5] w-full`}>
                        
                        </View>
</View>


<View style={className`w-full flex flex-col  bg-white  gap-4 mt-4`}>

    {/* <View>
        <Text style={className`text-[16px]  font-bold`}>Trip preference</Text>
    </View> */}


{
    showReport ? 
    <View style={className`flex flex-col gap-3`}>
        <Text style={className`text-black font-bold text-base`}>
            How was your ride
        </Text>

<View style={className`flex flex-row gap-3`}>
    {
  emoji.map((emoj, index) => (
    <View key={index} style={className`bg-[#F9F9F9] px-1 py-2 w-[64px] h-[69px] flex flex-col items-center justify-center`}>
      <Text style={{ fontSize: 20 }}>{emoj.icon}</Text>
      <Text style={className`text-sm text-black`}>{emoj.label}</Text>
    </View>
  ))
}

</View>

        <View style={
        className`flex-1 w-full flex-row gap-3 `
     }>
    <View 
           style={className` w-full h-[39px] bg-[#F7F7F7] rounded-lg p-1`}>
            <TextInput  
            placeholder='Leave a report ....'
            style={className` max-w-[204px] w-full h-[39px] bg-[#F7F7F7] rounded-lg`} />
        </View>

        
              <TouchableOpacity 
            //   onPress={() => route.push('/signin/loginOtp')}
        style={className`w-full h-[46px] bg-[#245AB0] flex items-center 
        justify-center rounded-[6px] w-[100px] `}>
            <Text style={className`text-white text-[16px]`}>Continue</Text>
        </TouchableOpacity>
             </View>

    </View>
    : 

     <View style={className`flex flex-row gap-1 `}>
        <TouchableOpacity  onPress={() => setShowReport(!showReport)}
         style={className`bg-[#245AB0] w-[271px] h-[44px] flex items-center justify-center rounded-lg`}>
            <Text style={className`text-white`}>Pay Now</Text>
        </TouchableOpacity>

        <View style={className`flex flex-row items-center justify-center border-[1px] border-[#E4EFFF]
            w-[85px] h-[44px] gap-1 rounded-r-lg`}>
        <Text style={className`text-black text-[14px]`}>Cash</Text>
        <Image source={down} alt=''
        style={className`w-[12px] h-[7px]`}  />
            
        </View>

    </View>
}
   

</View>

                </View>

</ScrollView>
   </View>

        </ImageBackground>
  )
}

export default ConfirmRide

const styles = StyleSheet.create({})