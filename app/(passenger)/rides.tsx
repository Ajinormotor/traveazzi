import { ActivityIndicator, Image, ScrollView, StyleSheet,
     Text, TouchableOpacity, View, RefreshControl } from  'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import className, { style } from 'twrnc'
import MapSheetScreen from '@/components/MapSheetScreen'
import bg from "../../assets/images/map_bg.png"
import cancel from "../../assets/images/cancel.png"
import load from "../../assets/images/available drivers.png"
// import routes_arrow from "../assets/images/routes_arrow.png"
import userOne from "../../assets/images/user_logo img (1).png"
import { Link, useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { getBookingRideId } from '@/lib/booking'
import { useDriverRideStore } from '@/store/driverStore'
import { usePassengerStore } from '@/store/passengerStore'
import { resolveDriverId } from '@/lib/favorites'


import dayjs from 'dayjs';

import up from "../../assets/images/up.png"
import downs from "../../assets/images/down_arrow.png"
import arrow from "../../assets/images/arrow-right.png"

import trip from "../..//assets/images/no_trip.png"
import Ionicons from '@expo/vector-icons/Ionicons'
import { formatPrice } from '@/lib/formatPrice'
import { getDriverName } from '@/lib/driver';

const Rides = () => {
const route = useRouter()
const { q } = useLocalSearchParams<{ q?: string }>()
const query = typeof q === 'string' ? q.toLowerCase() : '';

// const {logout} = useAuthStore()
const {rides, getAllRides, loading} = useDriverRideStore()
const { favorites, getFavoriteDrivers, addFavoriteDriver, removeFavoriteDriver, bookings, getMyBookings } = usePassengerStore()
const [pendingFavId, setPendingFavId] = useState<string | null>(null)

// Same filter-tab pattern as the driver home screen.
const rideFilters = [{ title: 'All Rides' }, { title: 'Active Rides' }, { title: 'Completed' }];
const [rideFilter, setRideFilter] = useState('All Rides');
const [refreshing, setRefreshing] = useState(false)

const refreshRides = async () => {
  await Promise.all([getAllRides(), getFavoriteDrivers(), getMyBookings({ silent: true })]);
};

// Refetch every time the screen comes back into view, so a ride booked or
// offered elsewhere shows up here without a manual pull.
useFocusEffect(
  useCallback(() => {
    refreshRides();
  }, []),
);

const handleRefresh = async () => {
  setRefreshing(true);
  try {
    await refreshRides();
  } finally {
    setRefreshing(false);
  }
};

useEffect(() => {
  getAllRides()
  getFavoriteDrivers()
},[])

// Driver ids of favorited drivers, resolved with the shared
// lib/favorites helper (fail-closed: no derivable id -> no heart).
const favoriteDriverIds = new Set(
  (Array.isArray(favorites) ? favorites : [])
    .map((f: any) => resolveDriverId(f))
    .filter((id): id is string => typeof id === 'string' && id.length > 0),
);

const handleFavoriteToggle = async (driverId: string, isFav: boolean) => {
  if (pendingFavId) return;
  setPendingFavId(driverId);
  try {
    const ok = isFav
      ? await removeFavoriteDriver(driverId)
      : await addFavoriteDriver(driverId);
    if (ok) await getFavoriteDrivers();
  } finally {
    setPendingFavId(null);
  }
};

const searchResults = Array.isArray(rides) && query
  ? rides.filter((r: any) => {
      const haystack = `${r?.destinationAddress ?? ''} ${r?.originAddress ?? ''} ${getDriverName(r?.driver, '')}`.toLowerCase();
      return haystack.includes(query);
    })
  : (Array.isArray(rides) ? rides : []);

// The passenger's own bookings, so a ride they already requested is labelled
// and filtered by the booking status rather than the ride status. Every booking
// is kept here, including finished ones, because the Completed filter needs to
// see them.
const myBookings = (Array.isArray(bookings) ? bookings : []).filter(
  (b: any) => b && typeof b === 'object',
);
const bookingByRide = new Map<string, any>();
for (const b of myBookings) {
  const rideId = getBookingRideId(b);
  if (rideId) bookingByRide.set(rideId, b);
}

// Only a live booking means the passenger is still travelling. CANCELLED_BY_*,
// REJECTED and NO_SHOW must not count, or a passenger who cancelled would be
// stuck on "Continue Ride" with no way to request the ride again.
const LIVE_BOOKING_STATUSES = ['PENDING', 'CONFIRMED'];
const isLiveBooking = (b: any) =>
  !!b && LIVE_BOOKING_STATUSES.includes(b?.status);

// A completed booking is finished, not live: the card should read "View Ride"
// and open the trip rather than sending the passenger back into an active trip.
const isCompletedBooking = (b: any) => !!b && b?.status === 'COMPLETED';

const filterRides = searchResults.filter((r: any) => {
  const booking = bookingByRide.get(r._id);
  // A joined ride reports its booking status; an open offer reports the ride's.
  const status = booking ? booking.status : r?.status;

  switch (rideFilter) {
    case 'Active Rides':
      return (
        status === 'PENDING' ||
        status === 'CONFIRMED' ||
        status === 'SCHEDULED' ||
        status === 'IN_PROGRESS'
      );
    case 'Completed':
      return status === 'COMPLETED';
    default:
      return true;
  }
});
  

  return (

      <MapSheetScreen
        mode="view"
        fallback={bg}
        initialRatio={0.5}
        minRatio={0.18}
        maxRatio={0.92}
        showMarker
        showLocateButton
        sheetBackgroundColor="#FFFFFF"
        sheetContentStyle={styles.sheetBody}
      >

{
  loading  ? 

  (
<View style={styles.sheetContent}  >

      <View style={className`flex flex-row items-center justify-between`}>
            <TouchableOpacity
              accessibilityLabel="Go back"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={() => route.back()}>
              <Ionicons name="arrow-undo-circle-outline" size={20} />
            </TouchableOpacity>
      </View>

      <View style={className`flex-1 items-center justify-center gap-3`}>
        <ActivityIndicator color="#245AB0" />
        <Text style={className`text-[#AAAAAA] text-[14px] font-bold`}>
          Fetching rides....
        </Text>
      </View>
      
    </View>

  )

:


(
<View style={styles.sheetContent}  >

    
{/* Header */}
   <View style={className`flex flex-row items-center justify-between`}>

        <View style={[className`flex flex-row items-center justify-center gap-2`]}>

      
        <Text style={className`font-medium text-[16px]`}>Available  ride</Text>
     <View style={[className`bg-black flex items-center justify-center rounded-full w-5 h-5`]}>
      <Text style={[className`text-white text-[12px]`]}>{filterRides.length}</Text>
     </View>

       </View>
        
     <TouchableOpacity
                          onPress={() => route.back()}>
                        {/* <Image source={cancel} style={className`w-[20px] h-[20px]`} /> */}
                           <Ionicons name="arrow-undo-circle-outline"  size={20} />
                      </TouchableOpacity>

      </View>



{/* Filter Tabs — outside the ScrollView so they stay pinned while the
    ride list scrolls under them. */}
<View style={className`flex flex-row gap-3 mt-3`}>
  {rideFilters.map((f) => (
    <TouchableOpacity
      key={f.title}
      onPress={() => setRideFilter(f.title)}
      style={[
        className`rounded-[8px] h-[30px] flex items-center justify-center px-2`,
        rideFilter === f.title ? className`bg-black` : className`bg-[#AAAAAA]`,
      ]}
    >
      <Text style={className`text-white text-sm`}>{f.title}</Text>
    </TouchableOpacity>
  ))}
</View>

<ScrollView
 showsVerticalScrollIndicator={false}
 style={className`flex-1 mt-3`}
 contentContainerStyle={className`gap-3 pb-3 px-1`}
 refreshControl={
   <RefreshControl
     refreshing={refreshing}
     onRefresh={handleRefresh}
     tintColor="#245AB0"
     colors={["#245AB0"]}
   />
 }
>



   
  <View style={className`flex flex-col gap-3`}>
        {
           filterRides.length > 0  ?


      <View style={className`flex flex-col gap-3`}>
        {
            filterRides.map((r: any) => {
              const driverId = resolveDriverId(r);
              const hasDriverId = typeof driverId === 'string' && driverId.length > 0;
              const isFav = hasDriverId && favoriteDriverIds.has(driverId);
              const favPending = hasDriverId && pendingFavId === driverId;
              return (

    <View key={r._id}  style={className`flex flex-col gap-2 border-[1px] border-[#ECECEC] rounded-[8px] overflow-hidden`}>

<View style={className`flex flex-col gap-[10px] bg-white p-3`} > 
 <View style={className`flex flex-row items-center justify-between`}>

    <View style={className`w-[101px] h-[31px] bg-[#F7F7F7] rounded-[5px] p-1 flex 
         flex-row items-center justify-center`}>
                            <Text style={className`text-[14px] font-bold text-[#434343]`}>
                              {r.vehicle.plateNumber}</Text>
                    </View>
                <View>
         <Text style={className`text-2xl text-[#008000]`}>₦{formatPrice(r.pricePerSeat)}</Text>
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
        <Text style={className`text-sm font-bold text-black`}> {getDriverName(r?.driver, 'Driver')} </Text>
        <Text style={className`font-bold text-[12px]  text-[#A1A1A1]`}> {r.vehicle?.make}, {r.vehicle?.color}
            </Text>
    </View>

</View>

<View style={className`flex flex-row items-center gap-3`}>
{driverId ? (
<TouchableOpacity onPress={() => handleFavoriteToggle(driverId, isFav)} disabled={!!favPending}
  style={className`${favPending ? 'opacity-60' : ''}`}>
    {favPending ? (
      <ActivityIndicator size="small" color="#245AB0" />
    ) : (
      <Ionicons name={isFav ? "heart" : "heart-outline"} size={20} color={isFav ? "#E0245E" : "#AAAAAA"} />
    )}
</TouchableOpacity>
) : null}

</View>

                    </View>
</View>

<View >


        <View style={className`flex flex-col bg-[#FAFAFA]`}>

    
        <View style={className`flex flex-row 
         items-center justify-between gap-[10px] w-full  p-3`}>

<View style={className`flex-1 flex flex-col gap-1`}>

<View style={className`flex flex-row gap-2`}>
    <Image source={up}  alt=""
    style={className`mt-[2px]`}  />
    <Text numberOfLines={2} style={className`text-[14px] font-bold flex-1`}>
  {r.originAddress}
      </Text>
</View>

<View style={className`flex flex-row gap-2`}>
    <Image source={downs}  alt=""
    style={className`mt-[2px]`}  />
    <Text numberOfLines={2} style={className`text-[14px] font-bold flex-1`}>
  {r.destinationAddress}
      </Text>
</View>

{/* <Text style={className`text-[12px] font-bold text-[#434343]`}>
    {r.destinationAddress}
</Text> */}

</View>

<View className='items-end flex-shrink-0'>
    <Text style={className`font-bold text-[18px]`}>
        {dayjs(r.departureTime).format('MMM D · h:mm A')}
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


{/* Request / continue. A live booking means the ride is still under way, so this
    must not offer a second request. A completed one is finished: "View Ride"
    opens the trip so it can be reviewed and the driver rated. */}
<View style={className`w-full flex flex-row items-center justify-center bg-white px-3 pb-3 pt-1`}>

<TouchableOpacity
onPress={() => {
  const booking = bookingByRide.get(r._id);
  if (isLiveBooking(booking)) {
    route.push({
      pathname: '/transitRide/[id]',
      params: { id: r._id, bookingId: booking._id },
    });
    return;
  }
  if (isCompletedBooking(booking)) {
    route.push({
      pathname: '/(passenger)/payRide/[id]',
      params: { id: r._id, bookingId: booking._id },
    });
    return;
  }
  route.push({
    pathname: '/(passenger)/confirmRide/[id]',
    params: { id: r._id },
  });
}}
style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]  `}>


  
      
    <Text style={className`text-white text-[16px]`}>
   {isLiveBooking(bookingByRide.get(r._id))
     ? 'Continue Ride'
     : isCompletedBooking(bookingByRide.get(r._id))
     ? 'View Ride'
     : 'Request To Join'}
    </Text>

</TouchableOpacity>

</View>

                </View>
              );
            })}
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

      </MapSheetScreen>

  )
}

export default Rides

const styles = StyleSheet.create({
  sheetBody: {
    paddingBottom: 16,
  },
  sheetContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 28,
  },
})





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