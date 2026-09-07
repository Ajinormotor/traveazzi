import { Image, ScrollView, StyleSheet,
     Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'

import bg from "../../assets/images/map_bg.png"
import className, { style } from 'twrnc'
import MapEmbed from '@/components/MapEmbed';
import marker from "../../assets/images/marker.png"
import down from "../../assets/images/down.png"

import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import options from "../../assets/images/options.png"
import indicator from "../../assets/images/indicator.png"
import { useDriverRideStore } from '@/store/driverStore'
import { Link } from 'expo-router'
import { useAuthStore } from '@/store/authStore'


export interface VehiclePayload {
  _id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  vehicleVerificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'; 
}


const Vehicle = () => {
const route = useRouter()

const { allVehicle , vehicles} = useDriverRideStore()
const [isLoading, setIsLoading] = useState(false)

useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        await allVehicle()
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles()
}, [])


// console.log('All vehicle', vehicles)

const [showMenu, setShowMenu] = useState(false)

const handleToggle = () => {
  setShowMenu(!showMenu)
}

const {logout} = useAuthStore()

const handleLogout = async() => {
  await logout()
  route.push('/(auth)')
}
  return (
   <View style={className`flex-1 `}>
   <MapEmbed mode="view" fallback={bg} />

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

     <View style={className`flex flex-row items-center gap-2  relative`}>
        <Text style={className`text-black text-2xl font-bold`}>Vehicle</Text>

<TouchableOpacity onPress={handleToggle}>
          <Image source={down} alt=''
        style={className`w-[12px] h-[7px]`}  />
</TouchableOpacity>

{showMenu && (
  <View style={className`
    absolute top-10 left-0 bg-white rounded-[8px] shadow-sm p-2 gap-3 bo
    items-center justify-center flex-col w-full z-100
    ${showMenu ? 'flex' : 'hidden'}
  `}>
    <TouchableOpacity>
      <Link href="/(driver)"
      style={className`border-b border-gray-200`}>
      <Text>Home</Text>
       </Link>
    </TouchableOpacity>

       <TouchableOpacity onPress={handleLogout}>
    
      <Text style={className`text-red-500 font-bold hover:text-red-300 z-30`}>
        Logout
        </Text>
      
    </TouchableOpacity>
  </View>
)}

    </View>

    
<TouchableOpacity  onPress={() => route.push('/(driver)/addVehicle')}
 style={className`flex  flex-row  items-center justify-center`}>

        
    <Ionicons name='add-outline' size={16} 
    color='#245AB0'  />
<Text style={className`text-[#245AB0] text-base`}> 
    Add New vehicle
    </Text>

    </TouchableOpacity>

    </View>
    
{/* Car Details */}
    
{isLoading ? (
  <View style={className`flex-1 items-center justify-center py-10`}>
    <ActivityIndicator size={30} color="black" />
  </View>
) : (
<View style={className`flex flex-col gap-3 mt-3`}>
  {vehicles.map((vehicle: VehiclePayload) => (
    <TouchableOpacity
      key={vehicle?._id}
      style={className`rounded-[8px] p-2 py-3 border-t border-[#ECECEC]`}
    >
      {/* Top Row */}
      <View style={className`flex flex-row items-center justify-between`}>
        <View style={className`flex flex-row gap-3`}>
          <Text style={className`text-black text-base`}>{vehicle.make}</Text>

          <View
            style={className`border-[1px] rounded-[8px] h-5 px-2 ${
              vehicle?.vehicleVerificationStatus === 'VERIFIED' ? 'border-[#008000]' : 'border-[#FFA500]'
            }`}
          >
            <Text
              style={className`text-[10px] text-center pt-[2.3px]  ${
              vehicle?.vehicleVerificationStatus  === 'VERIFIED' ? 'text-[#008000]' : 'text-[#FFA500]'
              }`}
            >
              { vehicle?.vehicleVerificationStatus }
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
          <Text style={className`text-[#333333] text-sm`}>{vehicle?.plateNumber}</Text>
        </View>

        {/* Vehicle Type */}
        <View style={className`flex flex-col items-start`}>
          <Text style={className`text-[#AAAAAA] text-sm`}>Vehicle Type</Text>
          <Text style={className`text-[#333333] text-sm`}>{vehicle?.model}</Text>
        </View>

        {/* Color */}
        <View style={className`flex flex-col items-start`}>
          <Text style={className`text-[#AAAAAA] text-sm`}>Year</Text>
          <Text style={className`text-[#333333] text-sm`}>{vehicle?.year}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ))}
</View>
)}

{!isLoading && Array.isArray(vehicles) && vehicles.length === 0 && (
  <View style={className`flex-1 items-center justify-center`}>
       <Text style={className`text-[#AAAAAA] text-2xl font-bold`}>
        No vehicle please add a vehicle
        </Text>
    </View>
)}

</View>

</View>

</View>

  )
}

export default Vehicle

const styles = StyleSheet.create({})