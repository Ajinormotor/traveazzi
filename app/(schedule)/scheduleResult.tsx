import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import className from 'twrnc'
import MapSheetScreen from '@/components/MapSheetScreen';
import bg from "../../assets/images/map_bg.png"
import load from "../../assets/images/available drivers.png"
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useDriverRideStore } from '@/store/driverStore'
import { formatPrice } from '@/lib/formatPrice';

const ScheduleResult = () => {
const { rides: storeRides, loading } = useDriverRideStore();
// Guard: the shared `rides` slot must always render as a list — a non-array
// here used to red-screen at rides.map with "undefined is not a function".
const rides = Array.isArray(storeRides) ? storeRides : [];
const route = useRouter()
  

const [ scheduled, setScheduled] = useState(false)

 

  return (
    <MapSheetScreen
      mode="view"
      fallback={bg}
      initialRatio={0.7}
      minRatio={0.3}
      maxRatio={0.95}
      showMarker
      sheetBackgroundColor="#FFFFFF"
      sheetContentStyle={styles.sheetContent}
    >


{

    loading  ? 

    (
<View style={className`flex-1 gap-7`}>

      <View style={className`flex flex-row items-center justify-between`}>
        <Text style={className`font-medium text-[16px]`}>Searching for available ride...</Text>

        
            <TouchableOpacity
              accessibilityLabel="Go back"
              onPress={() => route.back()}>
              <Ionicons name="arrow-undo-circle-outline" size={20} />
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

<ScrollView
showsVerticalScrollIndicator={false}
style={className`flex-1`}
contentContainerStyle={className`gap-7`}
>



      <View style={className`flex flex-row items-center justify-between`}>
        <Text style={className`font-medium text-[16px]`}>Available ride...</Text>

        
            <TouchableOpacity
              accessibilityLabel="Go back"
              onPress={() => route.back()}>
              <Ionicons name="arrow-undo-circle-outline" size={20} />
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
<Text style={className`text-[14px] font-bold text-[#434343]`}>{r.vehicleId ?? rideId}</Text>
                        </View>
                        <View>
                 <Text style={className`text-2xl text-[#008000]`}>₦{formatPrice(r.pricePerSeat ?? r.price)}</Text>
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

)

}

    </MapSheetScreen>
  )
}

export default ScheduleResult

const styles = StyleSheet.create({
  sheetContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
})