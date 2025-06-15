import { Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput,
     TouchableOpacity, View } from  'react-native'
import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { riderListData } from '@/constants/data/riderList'
import className, { style } from 'twrnc'
import transit_bg from "../../assets/images/bg_map_ongoing.png"
import indicator from "../../assets/images/indicator.png"
import distanceIcon from "../../assets/images/Flash-Fast-Speed--Streamline-Core.png.png"
import i from "../../assets/images/i.png"
import green_gps from "../../assets/images/green_gps.png"
import transit_car from "../../assets/images/car_9855634 1.png"
import { LinearGradient} from "expo-linear-gradient"

const TransitRide = () => {

const {id} = useLocalSearchParams()
const route = useRouter()

const item = riderListData.find(item => item.id === id)



const handleConfirm = (item: any) => {
  if (item?.id) {
    route.push(`/confirmRide/${item.id}`);
  } else {
    console.error('Invalid item or missing id');
  }
};

  return (
    <ImageBackground
    source={transit_bg} alt=''
    style={className`flex-1 `}
    >


<View style={className`h-1/2 relative `}>


</View>

<View 
style={className`h-1/2 bg-[#FAFAFA]  flex-col  rounded-t-[30px]  gap-2`}  >

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
            <Text style={className`font-bold text-[#000000]`} >59.25</Text>
            <Text style={className`font-medium text-[#AAAAAA] ml-1`}>km/hr</Text>
        </Text>
    </View>

<View style={className`flex flex-row items-center gap-1 `}>

<Text style={className`font-bold text-[#AAAAAA] text-[14px]`}>You should be arriving by</Text>

<View style={className`bg-[#F8FFFC] w-[103px] h-[30px] flex items-center justify-center text-center
  `}>
  <Text style={className`text-[#00B964] text-[16px] font-bold`}>   {item?.location_details?.[0]?.time}
  </Text>
</View>

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

    <View style={className`flex flex-row items-center gap-3 px-2 w-full h-[52px] bg-[#FAFAFA] rounded-[6px] py-[10px]`}>
                    <Image source={i} alt=''
 style={className``}   />

 <Text style={className`max-w-[300px] w-full`}>
    <Text style={className`text-[#AAAAAA] text-[12px]`}>Your safety comes first! Please fasten 
        your seatbelt and enjoy a smooth, secure ride.</Text>

 </Text>
                </View>

</View>

</View>

{/* Lower  */}
   <View  style={className`flex flex-col gap-2  py-3 bg-white px-2 `}>

<View style={className`flex flex-col gap-[10px] bg-white`} > 

                    <View style={className`flex flex-row items-center justify-between`}>

                        <View style={className`w-[101px] h-[31px] bg-[#F7F7F7] rounded-[5px] p-1 flex 
                            flex-row items-center justify-center`}>
                            <Text>{item?.plate_no}</Text>
                        </View>
                        <View>
                 <Text style={className`text-2xl text-[#008000] font-bold`}>NGN {item?.price}</Text>
                        </View>

                    </View>

                    <View style={className`border-[1px] border-[#F6F5F5] w-full`}>
                        
                    </View>

                   <View style={className`flex flex-row items-center justify-between`}>

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



                    </View>

                    <View style={className`border-[1px] border-[#F6F5F5] w-full`}>
                        
                        </View>
</View>



<View style={className`w-full flex flex-col  bg-white gap-2  pb-5`}>

    <Text style={className`text-[12px] font-bold`}>How's your trip going so far?</Text>

    <View style={className`flex flex-row gap-[10px]`}>

        <View 
           style={className` max-w-[204px] w-full h-[39px] bg-[#F7F7F7] rounded-lg`}>
            <TextInput  
            placeholder='Leave a report ....'
            style={className` max-w-[204px] w-full h-[39px] bg-[#F7F7F7] rounded-lg`} />
        </View>

        <View style={className`flex flex-row gap-2 items-center justify-center`}>
            <TouchableOpacity
            style={className`bg-[#DC3545] w-[69px] h-[39px] rounded-lg flex flex-row items-center justify-center `}>
                <Text style={className`text-white text-[14px] font-bold`}>Bad</Text>
            </TouchableOpacity>

            <TouchableOpacity 
            onPress={() => handleConfirm(item)}
            style={className`bg-[#28A745] w-[69px] h-[39px] rounded-lg flex flex-row items-center justify-center `}>
                <Text style={className`text-white text-[14px] font-bold`}>Good</Text>
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

export default TransitRide

const styles = StyleSheet.create({})