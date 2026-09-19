import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import className, { style } from 'twrnc'
import MapEmbed from '@/components/MapEmbed';
import bg from "../../assets/images/map_bg.png"
import marker from "../../assets/images/marker.png"
import directions from "../../assets/images/navigation-03.png"
import indicator from "../../assets/images/indicator.png"
import cancel from "../../assets/images/cancel.png"
import load from "../../assets/images/available drivers.png"
import { useRouter } from 'expo-router'
import { useDriverRideStore } from '@/store/driverStore'

const ScheduleResult = () => {
const { rides: storeRides, loading } = useDriverRideStore();
// Guard: the shared `rides` slot must always render as a list — a non-array
// here used to red-screen at rides.map with "undefined is not a function".
const rides = Array.isArray(storeRides) ? storeRides : [];
const route = useRouter()
  

const [ scheduled, setScheduled] = useState(false)

 

  return (

      <View style={className`flex-1 `}>
      <MapEmbed mode="view" fallback={bg} />

<View style={className`h-[30%] relative `}>

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

    loading  ?

    (
<View
    style={className`h-[70%] bg-white flex-col  rounded-t-[30px] py-4 px-3 gap-7`}  >

<TouchableOpacity style={className`w-full flex flex-row items-center justify-center`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>

      <View style={className`flex flex-row items-center justify-between`}>
        <Text style={className`font-medium text-[16px]`}>Searching for available ride...</Text>

        
            <TouchableOpacity>
              <Image source={cancel} alt='' style={className`w-[20px] h-[20px]`   }  />
            </TouchableOpacity>

      </View>

      <ActivityIndicator size="large" color="#245AB0" />

      <View style={className`flex-1`}>
      <Image  source={load} alt=''
      className='flex-1 h-full w-full' />

      </View>
    </View>

  )

:

(
<View 
style={className`h-[70%] bg-white flex-col  rounded-t-[30px] py-4 px-3 gap-7`}  >

    
<TouchableOpacity style={className`w-full flex flex-row items-center justify-center`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>


<ScrollView
showsVerticalScrollIndicator={false}

>



      <View style={className`flex flex-row items-center justify-between`}>
        <Text style={className`font-medium text-[16px]`}>Available ride...</Text>

        
            <TouchableOpacity>
              <Image source={cancel} alt='' style={className`w-[20px] h-[20px]`   }  />
            </TouchableOpacity>

      </View>

      <View style={className`flex flex-col gap-3`}>
        {rides.length === 0 ? (
          <View style={className`flex flex-col items-center justify-center py-10`}>
            <Text style={className`text-[16px] font-bold`}>No rides found</Text>
            <Text style={className`text-[14px] text-[#AAAAAA]`}>Try a different route or date.</Text>
          </View>
        ) : (
            rides.map((r: any) => {
              const rideId = r._id ?? r.id;
              return (
                <View key={rideId}  style={className`flex flex-col gap-2`}>

<View style={className`flex flex-col gap-[10px] bg-white`} >

                    <View style={className`flex flex-row items-center justify-between`}>

                        <View style={className`w-[101px] h-[31px] bg-[#F7F7F7] rounded-[5px] p-1 flex 
                            flex-row items-center justify-center`}>
                            <Text>{r.vehicleId ?? rideId}</Text>
                        </View>
                        <View>
                 <Text style={className`text-2xl text-[#008000]`}>₦{r.pricePerSeat ?? r.price}</Text>
                        </View>

                    </View>

                    <View style={className`border-[1px] border-[#F6F5F5] w-full`}>
                        
                    </View>

                   <View style={className`flex flex-col gap-1 py-4`}>

<View style={className`flex flex-col gap-1`}>
    <Text style={className`text-[14px] font-bold`}>{r.originAddress}</Text>
    <Text style={className`text-[12px] font-bold text-[#434343]`}>{r.destinationAddress}</Text>
</View>

{r.departureTime ? (
<View>
    <Text style={className`font-bold text-[18px]`}>{new Date(r.departureTime).toLocaleString()}</Text>
</View>
) : null}


                    </View>
</View>

<View style={className`w-full flex flex-row items-center justify-center bg-white`}>

{ scheduled ?

<TouchableOpacity
onPress={() => setScheduled(true)}
style={className`w-[361px] h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]  `}>
    <Text style={className`text-white text-[16px]`}>Request To Join</Text>
</TouchableOpacity>

:

<TouchableOpacity
 onPress={() => route.push({pathname: "/(passenger)/confirmRide/[id]", params: {id: rideId}})}
style={className`w-[361px] h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]  `}>
    <Text style={className`text-white text-[16px]`}>Request To Join</Text>
</TouchableOpacity>

        }

</View>

                </View>
              );
            })
        )}
      </View>

      </ScrollView>



</View>

)

}

        </View>

  )
}

export default ScheduleResult

const styles = StyleSheet.create({})