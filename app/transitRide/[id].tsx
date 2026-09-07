import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput,
     TouchableOpacity, View } from  'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import className from 'twrnc'
import MapEmbed from '@/components/MapEmbed';
import transit_bg from "../../assets/images/bg_map_ongoing.png"
import indicator from "../../assets/images/indicator.png"
import distanceIcon from "../../assets/images/Flash-Fast-Speed--Streamline-Core.png.png"
import i from "../../assets/images/i.png"
import green_gps from "../../assets/images/green_gps.png"
import transit_car from "../../assets/images/car_9855634 1.png"
import userOne from "../../assets/images/user_logo img (1).png"
import { LinearGradient } from "expo-linear-gradient"
import { useDriverRideStore } from '@/store/driverStore'
import { usePassengerStore } from '@/store/passengerStore'

const RATING_FACES = ['😞', '🙁', '😐', '🙂', '😍']

const STATUS_CONFIG: Record<string, { label: string; progress: string }> = {
  PENDING: { label: 'Waiting for driver to accept...', progress: '10%' },
  CONFIRMED: { label: 'Driver accepted! Ride starting soon', progress: '50%' },
  IN_PROGRESS: { label: 'Ride in progress', progress: '70%' },
}

const TransitRide = () => {

const { id, bookingId } = useLocalSearchParams<{ id?: string[] | string; bookingId?: string[] | string }>()
const rideId = Array.isArray(id) ? id[0] : id
const activeBookingId = Array.isArray(bookingId) ? bookingId[0] : bookingId
const route = useRouter()

const { singleRides } = useDriverRideStore()
const { getMyBookings, submitRating } = usePassengerStore()

const [rideDetails, setRideDetails] = useState<any>(null)
const [booking, setBooking] = useState<any>(null)
const [ratingScore, setRatingScore] = useState(0)
const [comment, setComment] = useState('')
const [submitting, setSubmitting] = useState(false)
const [fetchError, setFetchError] = useState<string | null>(null)

// fetch the actual ride details
const fetchRide = async () => {
    if (!rideId) return;
    setFetchError(null);
    try {
        const result = await singleRides(rideId);
        if (!result) {
            setFetchError('Failed to load ride. Please try again.');
            return;
        }
        setRideDetails(result);
    } catch {
        setFetchError('Failed to load ride. Please try again.');
    }
};

useEffect(() => {
    fetchRide();
}, [rideId])

// poll booking status until the trip ends
useEffect(() => {
    let cancelled = false;

    const poll = async () => {
        // silent: this runs every 5s, so a transient failure must not toast-spam
        const list = await getMyBookings({ silent: true });
        if (cancelled || !Array.isArray(list)) return;

        const match =
            list.find((b: any) => b?._id === activeBookingId) ??
            list.find((b: any) => {
                const bRideId = typeof b?.rideId === 'object' ? b?.rideId?._id : b?.rideId;
                return bRideId === rideId;
            });

        if (match) setBooking(match);
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => {
        cancelled = true;
        clearInterval(interval);
    };
}, [rideId, activeBookingId])

const status = booking?.status ?? 'PENDING';
const isTerminal = status === 'COMPLETED' || status === 'REJECTED' ||
    status === 'CANCELLED_BY_DRIVER' || status === 'CANCELLED_BY_PASSENGER';

const handleSubmitRating = async () => {
    if (!booking?._id || !ratingScore) return;
    setSubmitting(true);
    const ok = await submitRating(booking._id, ratingScore, comment.trim() || undefined);
    setSubmitting(false);

    if (ok) {
        // end the ride -> back to passenger home
        route.replace('/(passenger)/home');
    }
};

if (fetchError) {
    return (
        <View style={className`flex-1 items-center justify-center gap-3 bg-white`}>
            <Text style={className`text-[14px] text-[#333]`}>{fetchError}</Text>
            <TouchableOpacity
                onPress={fetchRide}
                style={className`bg-[#245AB0] px-6 h-[44px] flex items-center justify-center rounded-lg`}>
                <Text style={className`text-white`}>Retry</Text>
            </TouchableOpacity>
        </View>
    );
}

if (!rideDetails) {
    return (
        <View style={className`flex-1 items-center justify-center bg-white`}>
            <ActivityIndicator size={40} color="#245AB0" />
        </View>
    );
}

const item = rideDetails;
const config = STATUS_CONFIG[status];
const progressWidth = config?.progress ?? '100%';

  return (
    <View style={className`flex-1 `}>
    <MapEmbed mode="directions" origin={item?.originAddress} destination={item?.destinationAddress} fallback={transit_bg} />


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


<View style={className`flex flex-col gap-[10px] b py-3`}>

<View style={className`flex flex-col gap-[10px]`}>

    <View style={className`flex flex-row gap-[10px] items-center`}>
        <Image source={distanceIcon} alt=''
        style={className`w-[24px] h-[24px]`  }  />
        <Text style={className`text-[18px] font-bold ${isTerminal && status !== 'COMPLETED' ? 'text-[#DC3545]' : 'text-[#000000]'}`}>
            {status === 'COMPLETED' ? 'Trip completed!' :
             status === 'REJECTED' ? 'Booking declined' :
             status.startsWith('CANCELLED') ? 'Ride cancelled' :
             config?.label ?? 'Tracking ride...'}
        </Text>
    </View>

{!isTerminal && (
<View style={className`flex flex-row items-center gap-1 `}>

<Text style={className`font-bold text-[#AAAAAA] text-[14px]`}>You should be arriving by</Text>

<View style={className`bg-[#F8FFFC] w-[103px] h-[30px] flex items-center justify-center text-center
  `}>
  <Text style={className`text-[#00B964] text-[16px] font-bold`}>   
    {item?.departureTime ? new Date(item.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
  </Text>
</View>

</View>
)}
  

    </View>


{/* Linear gradient */}
    {!isTerminal && (
    <View style={className`flex flex-row items-center gap-[10px] h-[32px] w-full px-2 bg-[#FAFAFA] rounded-[4px]`}>

        <View style={className`flex flex-row items-center gap-[10px] w-[95%]`}>
            <LinearGradient
            colors={['#D3D3D3', '#000000']}
            style={{ height: 6, width: progressWidth as any }}
            />

        <Image source={transit_car} alt=''
            style={className`w-[24px] h-[16px]`} />
               <View style={className`bg-[#00B964] h-[6px] flex-1 rounded-[1px]`} ></View>

 </View>

        <View style={className`w-[5%]`}>
            <Image source={green_gps} alt=''
            style={className`w-[16px] h-[16px]`} />
        </View>

        
    </View>
    )}

    <View style={className`flex flex-row items-center gap-3 px-2 w-full h-[52px] bg-[#FAFAFA] rounded-[6px] py-[10px]`}>
                    <Image source={i} alt=''
 style={className``}   />

 <Text style={className`max-w-[300px] w-full`}>
    <Text style={className`text-[#AAAAAA] text-[12px]`}>{isTerminal && status !== 'COMPLETED' ? 'Unfortunately this ride will not be happening. You can search for another ride.' : 'Your safety comes first! Please fasten your seatbelt and enjoy a smooth, secure ride.'}</Text>

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
                            <Text>{item?.vehicle?.plateNumber}</Text>
                        </View>
                        <View>
                 <Text style={className`text-2xl text-[#008000] font-bold`}>₦{item?.pricePerSeat}</Text>
                        </View>

                    </View>

                    <View style={className`border-[1px] border-[#F6F5F5] w-full`}>
                        
                    </View>

                   <View style={className`flex flex-row items-center justify-between`}>

<View style={className`flex flex-row gap-1`}>

    <View>

    <Image source={userOne} alt=''
    className='w-[50px] h-[50px] rounded-full'  />
    </View>
    <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-sm font-bold text-black`}> {item?.rider_name ?? 'Your driver'} </Text>
        <Text style={className`font-bold text-[12px]  text-[#A1A1A1]`}> {item?.vehicle?.make}, {item?.vehicle?.color}
            </Text>
    </View>

</View>



                    </View>

                    <View style={className`border-[1px] border-[#F6F5F5] w-full`}>
                        
                        </View>
</View>


{status === 'COMPLETED' ? (

/* ---- inline rating: appears when the trip completes ---- */
<View style={className`w-full flex flex-col  bg-white gap-3  pb-5`}>

    <Text style={className`text-[14px] font-bold text-center`}>How was your trip with {' '}
      <Text style={className`text-[#245AB0]`}>{item?.rider_name ?? 'your driver'}</Text>?
    </Text>

    <View style={className`flex flex-row justify-center gap-4`}>
        {RATING_FACES.map((face, index) => (
            <TouchableOpacity
              key={face}
              onPress={() => setRatingScore(index + 1)}
              style={className`w-[44px] h-[44px] rounded-full items-center justify-center ${
                ratingScore === index + 1 ? 'bg-[#245AB0]' : 'bg-[#F7F7F7]'
              }`}>
              <Text style={className`text-[24px]`}>{face}</Text>
            </TouchableOpacity>
        ))}
    </View>

    <TextInput
      placeholder='Leave a comment (optional)...'
      value={comment}
      onChangeText={setComment}
      multiline
      maxLength={500}
      style={className`max-w-[204px] w-full min-h-[39px] bg-[#F7F7F7] rounded-lg px-2`}
    />

    <TouchableOpacity
      disabled={!ratingScore || submitting}
      onPress={handleSubmitRating}
      style={className`w-full h-[46px] ${ratingScore && !submitting ? 'bg-[#245AB0]' : 'bg-[#B0C4E8]'} flex items-center justify-center rounded-[6px]`}>
      {submitting
        ? <ActivityIndicator color="#fff" />
        : <Text style={className`text-white text-[16px] font-bold`}>Submit & End Trip</Text>}
    </TouchableOpacity>

    <TouchableOpacity onPress={() => route.replace('/(passenger)/home')}>
      <Text style={className`text-[12px] text-[#AAAAAA] text-center underline`}>Maybe later</Text>
    </TouchableOpacity>

</View>

) : isTerminal ? (

/* ---- ride ended without completing ---- */
<View style={className`w-full flex flex-col bg-white gap-3 pb-5 items-center`}>
    <Text style={className`text-[14px] text-[#AAAAAA] font-bold text-center`}>
        This ride didn't work out. Try searching for another one!
    </Text>
    <TouchableOpacity
      onPress={() => route.replace('/(passenger)/home')}
      style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]`}>
      <Text style={className`text-white text-[16px] font-bold`}>Back to Home</Text>
    </TouchableOpacity>
</View>

) : (

/* ---- during the trip ---- */
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
            style={className`bg-[#28A745] w-[69px] h-[39px] rounded-lg flex flex-row items-center justify-center `}>
                <Text style={className`text-white text-[14px] font-bold`}>Good</Text>
            </TouchableOpacity>

        </View>

    </View>

</View>
)}

                </View>
</ScrollView>
    </View>

        </View>
  )
}

export default TransitRide

const styles = StyleSheet.create({})
