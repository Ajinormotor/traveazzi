import { ActivityIndicator, Image, ImageBackground, ScrollView, StyleSheet,
     Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import className, { style } from 'twrnc'
import bg from "../../assets/images/map_bg.png"
import marker from "../../assets/images/marker.png"
import directions from "../../assets/images/navigation-03.png"
import indicator from "../../assets/images/indicator.png"
import cancel from "../../assets/images/cancel.png"
import load from "../../assets/images/available drivers.png"
import options from "../../assets/images/options.png"
import { riderListData } from '@/constants/data/riderList'
// import routes_arrow from "../assets/images/routes_arrow.png"
import userOne from "../../assets/images/user_logo img (1).png"
import { Link, useRouter, useLocalSearchParams } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { useDriverRideStore } from '@/store/driverStore'


import dayjs from 'dayjs';

import up from "../../assets/images/up.png"
import downs from "../../assets/images/down_arrow.png"
import arrow from "../../assets/images/arrow-right.png"

import trip from "../..//assets/images/no_trip.png"
import Ionicons from '@expo/vector-icons/Ionicons'

const Rides = () => {
const route = useRouter()
const { q } = useLocalSearchParams<{ q?: string }>()
const query = typeof q === 'string' ? q.toLowerCase() : '';

// const {logout} = useAuthStore()
const {rides, getAllRides, loading} = useDriverRideStore()

useEffect(() => {
  getAllRides()
},[])

const searchResults = Array.isArray(rides) && query
  ? rides.filter((r: any) => {
      const haystack = `${r?.destinationAddress ?? ''} ${r?.originAddress ?? ''} ${r?.rider_name ?? ''}`.toLowerCase();
      return haystack.includes(query);
    })
  : (Array.isArray(rides) ? rides : []);
  


  return (

      <ImageBackground
        source={bg} alt=''
        style={className`flex-1 `}
        >

<View style={className`h-1/2 relative `}>

<TouchableOpacity style={className`absolute left-[50px] bottom-[50px]`} >
<Image source={marker}  alt='' style={className`w-[100px] h-[100px]`}   />
</TouchableOpacity>

<TouchableOpacity style={className`absolute right-[30px] bottom-[20px]`}>

    <View style={className` w-[40px] h-[40px]  rounded-full bg-white flex flex-row items-center
         justify-center border-[1px] border-[#F0F0F0]`}>
    <Image source={directions}  alt='' style={className`w-[20px] h-[20px]`}   />
    </View>

</TouchableOpacity>

</View>

{
  loading  && <View style={[className`flex-1`]}>

    <ActivityIndicator  color="#fff" />
  </View>
}


{

    loading  ?

    (
<View
    style={className`h-1/2 bg-white flex-col  rounded-t-[30px] py-4 px-3 gap-7`}  >

<TouchableOpacity style={className`w-full flex flex-row items-center justify-center`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>

      <View style={className`flex flex-row items-center justify-between`}>
        

        
            <TouchableOpacity>
              <Image source={cancel} alt='' style={className`w-[20px] h-[20px]`   }  />
            </TouchableOpacity>

      </View>

      <View style={className`flex-1`}>
      {/* <Image  source={load} alt=''
      className='flex-1 h-full w-full' /> */}


    <ActivityIndicator  color="#245AB0" />
      </View>
      
    </View>

  )

:

(
<View 
style={className`h-1/2 bg-white flex-col  rounded-t-[30px] py-4 px-3 gap-7`}  >

    
<TouchableOpacity style={className`w-full flex flex-row items-center justify-center`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>


{/* Header */}
   <View style={className`flex flex-row items-center justify-between`}>

        <View style={[className`flex flex-row items-center justify-center gap-2`]}>

      
        <Text style={className`font-medium text-[16px]`}>Available  ride</Text>
     <View style={[className`bg-black flex items-center justify-center rounded-full w-5 h-5`]}>
      <Text style={[className`text-white text-[12px]`]}>{searchResults.length}</Text>
     </View>

       </View>
        
     <TouchableOpacity
                          onPress={() => route.back()}>
                        {/* <Image source={cancel} style={className`w-[20px] h-[20px]`} /> */}
                           <Ionicons name="arrow-undo-circle-outline"  size={20} />
                      </TouchableOpacity>

      </View>



<ScrollView
showsVerticalScrollIndicator={false}

>



   
      <View style={className`flex flex-col gap-3`}>
        {
           searchResults.length > 0  ?


      <View style={className`flex flex-col gap-3`}>
        {
           searchResults.map((r: any) => (

    <View key={r._id}  style={className`flex flex-col gap-2`}>

<View style={className`flex flex-col gap-[10px] bg-white`} > 
 <View style={className`flex flex-row items-center justify-between`}>

    <View style={className`w-[101px] h-[31px] bg-[#F7F7F7] rounded-[5px] p-1 flex 
         flex-row items-center justify-center`}>
                            <Text>
                              {r.vehicle.plateNumber}</Text>
                    </View>
                <View>
         <Text style={className`text-2xl text-[#008000]`}>₦{r.pricePerSeat}</Text>
                        </View>

                    </View>

                    {/* <View style={className`border-[1px] border-[#F6F5F5] w-full`}>
                        
                    </View> */}

                   <View style={className`flex flex-row items-center justify-between`}>

<View style={className`flex flex-row gap-1`}>
    <View>

    <Image source={userOne} alt=''
    className='w-[50px] h-[50px] rounded-full'  />

    </View>

    <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-sm font-bold text-black`}> {r.rider_name} </Text>
        <Text style={className`font-bold text-[12px]  text-[#A1A1A1]`}> {r.vehicle?.make}, {r.vehicle?.color}
            </Text>
    </View>

</View>

<TouchableOpacity>

    <Image source={options} alt=''
    className='w-[20px] h-[20px] rounded-full'  />

</TouchableOpacity>

                    </View>
</View>

<View >


        <View style={className`flex flex-col bg-[#FAFAFA]`}>

    
        <View style={className`flex flex-row 
         items-center justify-between gap-[10px] w-full  p-3`}>

<View style={className`flex flex-col gap-1 py-4`}>

<View style={className`flex flex-row gap-1`}>
    <Image source={up}  alt=""
    style={className``}  />
    <Text style={className`text-[14px] font-bold`}>
  {r.destinationAddress}
      </Text>
</View>

<View style={className`flex flex-row gap-1`}>
    <Image source={downs}  alt=""
    style={className``}  />
    <Text style={className`text-[14px] font-bold`}>
  {r.originAddress}
      </Text>
</View>

{/* <Text style={className`text-[12px] font-bold text-[#434343]`}>
    {r.destinationAddress}
</Text> */}

</View>

<View>
    <Text style={className`font-bold text-[18px]`}>
        {dayjs(r.departureTime).format('h:mm A')}
    </Text>
</View>


        </View>

{/* {
    location.view &&    
    <View style={className`bg-black rounded-lg flex flex-row items-center justify-center
     max-w-[113px] h-[32px] w-full mx-3 gap-1`}>
    <Text style={className`text-[12px] font-bold text-white`}>{location.view}</Text>
    <Image source={routes_arrow}  alt=""
    style={className`w-[20px] h-[20px]`}  />
    </View>
}
      */}

        </View>


</View>


{/* request button to join */}
<View style={className`w-full flex flex-row items-center justify-center bg-white`}>


<TouchableOpacity
  // onPress={() => route.push(`/confirmRide/${r._id}`)}
onPress={() => 
    route.push({
      pathname: "/(passenger)/confirmRide/[id]",
      params: { id: r._id },
    })
}
style={className`w-[361px] h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]  `}>


  
  
      
   {r.status === 'SCHEDULED' ? 'Continue Ride' : 'Request To Join'}

</TouchableOpacity>

</View>

                </View>
            )) 
          }
   </View>
            :
 <View style={className`flex-1 flex-col items-center justify-center min-h-[300px] gap-3`}>
<Image source={trip} alt=''
style={className`w-[120px] h-[120px]`}  />
    <Text style={className`text-[#AAAAAA] text-[16px] font-bold`}>
      {query ? `No rides found for "${q}"` : 'No rides available'}
    </Text>
    </View>

        }
      </View>

      </ScrollView>



</View>

)

}

        </ImageBackground>

  )
}

export default Rides

const styles = StyleSheet.create({})





//     <Image  source={trip}
// style={{}  }  />
//        <Text style={className`text-[#AAAAAA] text-2xl font-bold`}>No rides available</Text>

//        <TouchableOpacity  onPress={ () => route.push('/(passenger)/rides') }
   
//        >

//         <Text    style={
//       className`text-blue-500 text-base`
//      } >
//   Home
//         </Text>
     
       
//        </TouchableOpacity>