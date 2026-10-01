import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet,
     Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import className, { style } from 'twrnc'
import MapSheetScreen from '@/components/MapSheetScreen';
import bg from "../../../assets/images/map_bg.png"
import { useLocalSearchParams, useRouter, useSearchParams } from 'expo-router/build/hooks'
import cancel from "../../../assets/images/cancel.png"
import receipt from "../../../assets/images/reciept.png"
import options from "../../../assets/images/options.png"
import danger from "../../../assets/images/danger.png"
import routes_arrow from "../../../assets/images/routes_arrow.png"
import down from "../../../assets/images/down.png"
import call from  "../../../assets/images/call_logo.png"
import chat from "../../../assets/images/chat_logo (2).png"
import chatTwo from "../../../assets/images/chat_logo.png"
import white_receipt from "../../../assets/images/white_receipt.png"
import white_cancel from "../../../assets/images/white_cancel.png"
import { useDriverRideStore } from '@/store/driverStore'

import userOne from "../../../assets/images/user_logo img (1).png"
import up from "../../../assets/images/up.png"
import downs from "../../../assets/images/down_arrow.png"

import dayjs from 'dayjs'
import { usePassengerStore } from '@/store/passengerStore'
import Ionicons from '@expo/vector-icons/Ionicons'
import { formatPrice } from '@/lib/formatPrice'
import { findActiveBookingForRide, findActiveBookingOnOtherRide, getBookingRideId } from '@/lib/booking';
import { getDriverName } from '@/lib/driver';

const ConfirmRide = () => {

const { id } = useLocalSearchParams();
const route = useRouter();

const { rides, singleRides } = useDriverRideStore();
const { requestBookings, getMyBookings, cancelBooking } = usePassengerStore(); 

const [rideDetails, setRideDetails] = useState<any>(null);
const [existingBooking, setExistingBooking] = useState<any>(null);
const [myBookings, setMyBookings] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(false)
const [isCancelling, setIsCancelling] = useState(false);
const [fetchError, setFetchError] = useState<string | null>(null);
const isMounted = useRef(true);

useEffect(() => {
  isMounted.current = true;
  return () => { isMounted.current = false; };
}, []);

const loadSingleRide = async () => {
  const rideId = Array.isArray(id) ? id[0] : id ?? '';
  try {
    return await singleRides(rideId);
  } catch {
    return null;
  }
};

const applyRide = (result: any) => {
  if (!result) {
    setFetchError('Failed to load ride. Please try again.');
    return;
  }
  setFetchError(null);
  setRideDetails(result);
};

const applyBookings = (list: any, rideId: string | undefined) => {
  if (!isMounted.current) return;
  setMyBookings(Array.isArray(list) ? list : []);
  setExistingBooking(findActiveBookingForRide(list, rideId));
};

const fetchingSingleRide = async () => {
  applyRide(await loadSingleRide());
};

useEffect(() => {
  let cancelled = false;
  const rideId = Array.isArray(id) ? id[0] : id ?? '';

  (async () => {
    // Load both: the ride drives the layout, the passenger's own bookings decide
    // whether the action is "Request Ride" or "Continue Ride".
    const [result, list] = await Promise.all([
      loadSingleRide(),
      getMyBookings({ silent: true }).catch(() => []),
    ]);
    if (cancelled) return;
    applyRide(result);
    applyBookings(Array.isArray(list) ? list : [], rideId);
  })();

  return () => {
    cancelled = true;
  };
}, [id]);

if (fetchError) {
  return (
    <View style={[className`flex-1 items-center justify-center gap-3 bg-white`]}>
      <Text style={className`text-[14px] text-[#333]`}>{fetchError}</Text>
      <TouchableOpacity
        onPress={fetchingSingleRide}
        style={className`bg-[#245AB0] px-6 h-[44px] flex items-center justify-center rounded-lg`}>
        <Text style={className`text-white`}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

if (!rideDetails) return <View style={[className`flex-1 items-center justify-center`]}><ActivityIndicator size={40}  color="#000"  /></View>; 

const item = rideDetails;
const vehicle = rideDetails?.vehicle;
const driverName = getDriverName(rideDetails?.driver, 'Your driver');

const totalSeats =
  Number(rideDetails?.initialSeats) || Number(rideDetails?.availableSeats) || 0;

// Seats already taken on this ride. initialSeats is the capacity the driver
// offered, so what is left is what the passenger is actually asking for.
const seatsBooked = Math.max(
  0,
  (rideDetails?.initialSeats ?? 0) - (rideDetails?.availableSeats ?? 0)
);

const DEPARTURE_LABEL = rideDetails?.departureTime
  ? dayjs(rideDetails.departureTime).format('MMM D, YYYY h:mm A')
  : 'Time not set';
// console.log('Ride details:', item);

const handleTransit = (item: any) => {
  if (item?._id) {
    route.push(`/transitRide/${item._id}`); // ✅ use _id not id
  } else {
    console.error('Invalid item or missing id');
  }
};



const handleConfirm = async () => {
  // Already on this ride -> never create a second booking, just continue.
  if (existingBooking?._id) {
    route.push({
      pathname: '/transitRide/[id]',
      params: { id: item._id, bookingId: existingBooking._id },
    });
    return;
  }

  setIsLoading(true);

  if (item?.status === 'IN_PROGRESS') {
    // Already travelling on another ride -> never drop straight into this
    // ride's Journey Underway. Send them back to the ride they are on.
    const other = findActiveBookingOnOtherRide(myBookings, item?._id);
    if (other) {
      setIsLoading(false);
      Alert.alert(
        'You are already on a ride',
        'Finish your current trip before joining another ride.',
        [
          { text: 'Not now', style: 'cancel' },
          {
            text: 'Go to my ride',
            onPress: () =>
              route.push({
                pathname: '/transitRide/[id]',
                params: {
                  id: getBookingRideId(other) ?? '',
                  bookingId: other?._id,
                },
              }),
          },
        ],
      );
      return;
    }

    setIsLoading(false)
    route.push({
      pathname: '/(passenger)/payRide/[id]',
      params: { id: item._id }
    });
    return;
  }

    const payload = {
      rideId: item._id,
      seatsNeeded: item?.initialSeats ?? 1,
      pickupAddress: item?.destinationAddress,
      dropoffAddress: item?.originAddress,
    };

    const booking = await requestBookings(payload as any);
    setIsLoading(false);

    // booking created -> go to live trip tracking
    if (booking?._id || booking?.id) {
      route.push({
        pathname: '/transitRide/[id]',
        params: { id: item._id, bookingId: booking._id ?? booking.id },
      });
    }
};

const handleCancel = async () => {
  if (isCancelling) return;
  setIsCancelling(true);
  try {
    const list = (await getMyBookings({ silent: true })) ?? [];
    if (!isMounted.current) return;
    const match = list.find((b: any) => {
      const rid = b?.ride?._id ?? (typeof b?.rideId === 'object' ? b?.rideId?._id : b?.rideId);
      return rid === item?._id;
    });
    if (!match?._id) {
      setIsCancelling(false);
      if (!isMounted.current) return;
      route.back();
      return;
    }
    const ok = await cancelBooking(match._id);
    if (!isMounted.current) return;
    setIsCancelling(false);
    if (ok) route.back();
  } finally {
    if (isMounted.current) setIsCancelling(false);
  }
};


  return (
 
    <MapSheetScreen
      mode="directions"
      origin={item?.originAddress}
      destination={item?.destinationAddress}
      fallback={bg}
      initialRatio={0.75}
      minRatio={0.3}
      maxRatio={0.95}
      showMarker
      sheetBackgroundColor="#FAFAFA"
      sheetContentStyle={styles.sheetContent}
    >

<ScrollView
showsVerticalScrollIndicator={false}
style={className`flex-1`}
contentContainerStyle={className`gap-3`}
>
    <View style={className`flex flex-col w-full bg-white`}
>

   <View style={className`flex flex-row w-full items-center justify-between bg-white`}>

    <View style={className`flex flex-row items-center justify-between gap-[10px] w-full p-3`}>

      <View style={className`flex flex-col gap-1 py-4`}>
        <Text style={className`text-[20px] font-bold`}>
            Ride to {item?.destinationAddress ?? 'your destination'}
            </Text>
        <Text style={className`text-[12px] font-bold text-[#AAAAAA]`}>
          Pickup at {item?.originAddress ?? 'the meetup point'}
            </Text>
      </View>

      
      <TouchableOpacity
                          onPress={() => route.back()}>
                        {/* <Image source={cancel} style={className`w-[20px] h-[20px]`} /> */}
                           <Ionicons name="arrow-undo-circle-outline"  size={20} />
                      </TouchableOpacity>
    </View>



  </View>


<View style={className`flex flex-row items-center justify-start px-3 gap-2`}>

   { item?.status === 'SCHEDULED' ? <TouchableOpacity  onPress={handleCancel} disabled={isCancelling}
    style={className`w-[175px] h-[36px] flex flex-row  items-center justify-center
         gap-2 rounded-lg bg-[#DC3545] ${isCancelling ? 'opacity-60' : ''}`}>
        <Image source={white_cancel}  alt=''
        style={className`flex flex-row items-center justify-center` } />
        {isCancelling ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={className`text-white`}>Cancel Ride</Text>
        )}
    </TouchableOpacity>

    :

    ''
}

</View>



</View>

<View style={className`bg-white p-3 mt-3`}>

       
                <View  style={className`flex flex-col gap-3`}>

{/* ---- Ride Details: same card layout as the passenger Manage Ride ---- */}
<View style={className`w-full flex flex-col gap-3 bg-[#FAFAFA] rounded-[6px] p-3`}>
  <Text style={className`text-[15px] font-bold text-black`}>Ride Details</Text>

  <View style={className`flex flex-col gap-2`}>

  {/* Origin */}
  <View style={className`flex flex-row gap-2`}>
    <Image source={up} alt='' style={className`mt-[2px]`} />
    <Text numberOfLines={2} style={className`text-[14px] font-bold flex-1`}>
      {item?.originAddress ?? '—'}
    </Text>
  </View>

  {/* Departure time and price, sitting between the two locations */}
  <View style={className`flex flex-row items-center gap-3 py-1`}>
    <View
      style={className`rounded-lg flex items-center justify-center h-[32px] px-2 self-start bg-[#F0F0F0]`}
    >
      <Text numberOfLines={1} style={className`text-[12px] font-bold text-[#8C8C8C]`}>
        {DEPARTURE_LABEL}
      </Text>
    </View>

    <View style={className`flex-1 h-[2px] bg-[#E2E2E2]`} />

    <Text numberOfLines={1} style={className`text-[#008000] text-sm font-semibold`}>
      ₦{formatPrice(item?.pricePerSeat)}
    </Text>
  </View>

  {/* Destination — where he or she is heading */}
  <View style={className`flex flex-row gap-2`}>
    <Image source={downs} alt='' style={className`mt-[2px]`} />
    <Text numberOfLines={2} style={className`text-[14px] font-bold flex-1`}>
      {item?.destinationAddress ?? '—'}
    </Text>
  </View>
  </View>

  {/* Seats booked, on its own line under a divider */}
  <View
    style={className`flex flex-row items-center justify-between border-t border-[#E5E5E5] pt-3`}
  >
    <Text style={className`font-bold text-[#AAAAAA] text-[14px]`}>Seats booked</Text>
    <Text numberOfLines={1} style={className`text-[14px] font-bold`}>
      {seatsBooked}{totalSeats ? ` of ${totalSeats}` : ''}
    </Text>
  </View>
</View>

{/* ---- Driver details: same card layout as the passenger Manage Ride ---- */}
<View style={className`w-full flex flex-col gap-3`}>
  <Text style={className`text-[15px] font-bold text-black`}>Driver details</Text>

  <View style={className`w-full flex flex-col gap-3 bg-[#FAFAFA] rounded-[6px] p-3`}>
    <View style={className`flex flex-row items-center gap-3`}>
      <View>
        <Image source={userOne} alt='' className='w-[50px] h-[50px] rounded-full' />
      </View>

      <View style={className`flex-1 flex flex-col gap-[2px]`}>
        <Text numberOfLines={1} style={className`text-[15px] font-bold text-black`}>
          {driverName}
        </Text>

        {vehicle ? (
          <Text numberOfLines={1} style={className`text-[12px] font-bold text-[#A1A1A1]`}>
            {[vehicle.color, vehicle.make, vehicle.model, vehicle.year]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        ) : null}

        {item?.initialSeats != null ? (
          <Text style={className`font-bold text-[12px] text-[#A1A1A1]`}>
            {item.initialSeats} seat{item.initialSeats === 1 ? '' : 's'} available
          </Text>
        ) : null}
      </View>
    </View>

    {/* Plate number, so the rider can confirm the right car before riding. */}
    <View style={className`flex flex-row items-center justify-between`}>
      <Text style={className`text-[13px] font-bold text-[#AAAAAA]`}>Plate number</Text>
      <View
        style={className`min-w-[101px] h-[31px] bg-[#F0F0F0] rounded-[6px] px-3 flex flex-row items-center justify-center`}
      >
        <Text style={className`text-[14px] font-bold text-black`}>
          {vehicle?.plateNumber ?? '—'}
        </Text>
      </View>
    </View>
  </View>
</View>

<View style={className`flex flex-row gap-2 hidden`}>
<TouchableOpacity>
    <Image source={chatTwo} alt=''
    className='w-[20px] h-[20px] rounded-full'  />
</TouchableOpacity> 



<TouchableOpacity>
    <Image source={call} alt=''
    className='w-[20px] h-[20px] rounded-full'  />
</TouchableOpacity> 

<View style={className`border-[#CACACA] border-[1px] h-[24px] w-[0px]`}>

</View>

<TouchableOpacity>
    <Image source={chat} alt=''
    className='w-[20px] h-[20px] rounded-full'  />
</TouchableOpacity> 
</View>

</View>

                {/*<View style={className`flex flex-row items-center gap-3 px-6 w-full bg-[#FAFAFA] rounded-lg py-[10px]`}>
                    <Image source={danger} alt=''
 style={className``}   />

 <Text style={className`flex-1`}>
    <Text style={className`text-[#AAAAAA] text-[12px]`}><Text style={className`text-[#28A745] hidden opacity-0`}>
      {item?.driver?.firstName ?? ''} {item?.driver?.lastName ?? ''} </Text> is currently mile away from your 
        closest landmark: <Text style={className`text-[#007BFF] opacity-0`}> </Text> You can call the driver to discuss
                a suitable meetup point.
              </Text>

 </Text>
                </View>*/}
      
      </View>

{/* trip preference */}
<View style={className`w-full flex flex-col  bg-white p-3 gap-4 mt-4`}>

    <View>
        <Text style={className`text-[16px]  font-bold`}>Trip preference</Text>
    </View>

    <View style={className`w-full flex flex-row gap-1`}>
      
        <TouchableOpacity  onPress={() => handleConfirm()} disabled={isLoading}
         style={className`bg-[#245AB0] flex-1 h-[44px] flex items-center justify-center rounded-lg ${isLoading ? 'opacity-60' : ''}`}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
            <Text style={className`text-white text-[16px] font-bold`}>
             {/* Already requested -> continue the existing booking, never a new one. */}
             { existingBooking ? 'Continue Ride'
               : item?.status === 'IN_PROGRESS' ? 'Continue Ride'
               : 'Request Ride' }
             </Text>
            )}
        </TouchableOpacity>

        <View style={className`flex flex-row items-center justify-center border-[1px] border-[#E4EFFF]
            w-[85px] h-[44px] gap-1 rounded-r-lg`}>
        <Text style={className`text-black text-[14px]`}>Cash</Text>
        <Image source={down} alt=''
        style={className`w-[12px] h-[7px]`}  />
            
        </View>

    </View>

</View>

</ScrollView>

    </MapSheetScreen>

  )
}

export default ConfirmRide

const styles = StyleSheet.create({
  sheetContent: {
    paddingTop: 12,
    paddingBottom: 16,
    gap: 28,
  },
});