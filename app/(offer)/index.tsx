import { Image, ImageBackground, ScrollView, StyleSheet,
     Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

import bg from "../../assets/images/map_bg.png"
import className, { style } from 'twrnc'
import marker from "../../assets/images/marker.png"
import down from "../../assets/images/down.png"
import { riderlist, riderListData } from '@/constants/data/riderList'
import indicator from "../../assets/images/indicator.png"
import cancel from "../../assets/images/cancel.png"
import { useRouter } from 'expo-router'
import { vehicelData } from '@/constants/data/vehicle'
import Ionicons from '@expo/vector-icons/Ionicons'
import options from "../../assets/images/options.png"




const OfferIndex = () => {
const route = useRouter()

  return (
   <ImageBackground
    source={bg} alt=''
    style={className`flex-1 `}
    >

<View style={className`h-[15%] relative `}>

<TouchableOpacity style={className`absolute left-[50px] bottom-[50px]`} >
<Image source={marker}  alt='' style={className`w-[100px] h-[100px]`}   />
</TouchableOpacity>
</View>

<View
style={className`h-[85%] bg-[#FAFAFA] flex-col flex rounded-t-[30px]  gap-7 p-1`}  >




    <View style={className`flex flex-col gap-4 w-full bg-white h-full p-3`} >

       <TouchableOpacity style={className`w-full flex flex-row items-center justify-center`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>




     <View style={className`flex flex-row items-center justify-between`}>
    <View style={className`flex flex-row items-center gap-2 `}>
        <Text style={className`text-black text-2xl font-bold`}>Vehicle</Text>

          <Image source={down} alt=''
        style={className`w-[12px] h-[7px]`}  />
    </View>

    
<TouchableOpacity  onPress={() => route.push('/addVehicle')}
 style={className`flex  flex-row  items-center justify-center`}>

        
    <Ionicons name='add-outline' size={16} 
    color='#245AB0'  />
<Text style={className`text-[#245AB0] text-base`}> 
    Add New vehicle
    </Text>

    </TouchableOpacity>

    </View>
    
{/* Car Details */}
    
<View style={className`flex flex-col gap-3 mt-3`}>
  {vehicelData.map((vehicle, index) => (
    <TouchableOpacity onPress={()=> route.push('/create')}
      key={index}
      style={className`rounded-[8px] p-2 py-3 border-t border-[#ECECEC]`}
    >
      {/* Top Row */}
      <View style={className`flex flex-row items-center justify-between`}>
        <View style={className`flex flex-row gap-3`}>
          <Text style={className`text-black text-base`}>{vehicle.title}</Text>

          <View
            style={className`border-[1px] rounded-[8px] h-5 px-2 ${
              vehicle.status === 'Verified' ? 'border-[#008000]' : 'border-[#FFA500]'
            }`}
          >
            <Text
              style={className`text-[10px] text-center pt-[2.3px]  ${
                vehicle.status === 'Verified' ? 'text-[#008000]' : 'text-[#FFA500]'
              }`}
            >
              {vehicle.status}
            </Text>
          </View>
        </View>

        <Image source={options} alt="" style={className``} />
      </View>

      {/* Bottom Row */}
      <View style={className`flex flex-row items-center gap-4 mt-2`}>
        {/* Plate Number */}
        <View style={className`flex flex-col items-start`}>
          <Text style={className`text-[#AAAAAA] text-sm`}>Plate Number</Text>
          <Text style={className`text-[#333333] text-sm`}>{vehicle.plate_no}</Text>
        </View>

        {/* Vehicle Type */}
        <View style={className`flex flex-col items-start`}>
          <Text style={className`text-[#AAAAAA] text-sm`}>Vehicle Type</Text>
          <Text style={className`text-[#333333] text-sm`}>{vehicle.vehicle_type}</Text>
        </View>

        {/* Color */}
        <View style={className`flex flex-col items-start`}>
          <Text style={className`text-[#AAAAAA] text-sm`}>Color</Text>
          <Text style={className`text-[#333333] text-sm`}>{vehicle.color}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ))}
</View>


</View>
</View>
</ImageBackground>

  )
}

export default OfferIndex

const styles = StyleSheet.create({})