import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput,
     TouchableOpacity, View } from  'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import className from 'twrnc'
import MapSheetScreen from '@/components/MapSheetScreen';
import transit_bg from "../../assets/images/bg_map_ongoing.png"
import i from "../../assets/images/i.png"
import userOne from "../../assets/images/user_logo img (1).png"
import { useDriverRideStore } from '@/store/driverStore'
import { usePassengerStore } from '@/store/passengerStore'
import { formatPrice } from '@/lib/formatPrice';
import dayjs from 'dayjs';
import Ionicons from '@expo/vector-icons/Ionicons'
import { getDriverName } from '@/lib/driver'
import up from "../../assets/images/up.png"
import downs from "../../assets/images/down_arrow.png"
import RideStepTracker, { type RideStep } from '@/components/RideStepTracker'

const RATING_FACES = ['😞', '🙁', '😐', '🙂', '😍']

const STATUS_CONFIG: Record<string, { label: string }> = {
  PENDING: { label: 'Waiting for driver to accept...' },
  CONFIRMED: { label: 'Driver accepted! Ride starting soon' },
  IN_PROGRESS: { label: 'Ride in progress' },
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

// load the ride once; every setState happens after the await, so the effect
// below never triggers a cascading synchronous render
const loadRide = async () => {
    if (!rideId) return null;

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

// used by the Retry button
const fetchRide = async () => {
    applyRide(await loadRide());
};

useEffect(() => {
    let cancelled = false;

    (async () => {
        const result = await loadRide();
        if (cancelled) return;
        applyRide(result);
    })();

    return () => {
        cancelled = true;
    };
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

// The API populates `driver` (firstName, lastName, avatar,
// averageRatingAsDriver, totalRatingsAsDriver) and `vehicle` on a single ride.
const driver = item?.driver;
const vehicle = item?.vehicle;
const driverName = getDriverName(driver, 'Your driver');
const driverRating =
  typeof driver?.averageRatingAsDriver === 'number'
    ? driver.averageRatingAsDriver
    : null;

const seatsBooked =
  booking?.seatsBooked ??
  Math.max(0, (item?.initialSeats ?? 0) - (item?.availableSeats ?? 0));

const totalSeats = Number(item?.initialSeats) || Number(item?.availableSeats) || 0;

const DEPARTURE_LABEL = item?.departureTime
  ? dayjs(item.departureTime).format('MMM D, YYYY · h:mm A')
  : '—';

// Same tracker the driver sees, driven by this passenger's real booking status.
// CONFIRMED/IN_PROGRESS/COMPLETED are order-preserving, so "at least" works.
const ACCEPTED_STATES = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
const REACHED = (states: string[]) => states.includes(status);

const passengerSteps: RideStep[] = [
  {
    key: 'scheduled',
    label: 'Ride scheduled',
    detail: DEPARTURE_LABEL,
    done: true,
  },
  {
    key: 'accepted',
    label: 'Driver accepted',
    detail: REACHED(ACCEPTED_STATES) ? `${driverName} is on the way` : 'Waiting for a driver to accept',
    done: REACHED(ACCEPTED_STATES),
  },
  {
    key: 'transit',
    label: 'In transit',
    detail: REACHED(['IN_PROGRESS', 'COMPLETED'])
      ? 'Enjoy your trip'
      : 'Starts at the departure time',
    done: REACHED(['IN_PROGRESS', 'COMPLETED']),
  },
  {
    key: 'done',
    label: 'Dropped off',
    detail: status === 'COMPLETED' ? 'Trip completed' : 'Not yet',
    done: status === 'COMPLETED',
  },
];

  return (
    <MapSheetScreen
      mode="directions"
      origin={item?.originAddress}
      destination={item?.destinationAddress}
      fallback={transit_bg}
      initialRatio={0.5}
      minRatio={0.25}
      maxRatio={0.95}
      showMarker={false}
      sheetBackgroundColor="#FFFFFF"
      sheetContentStyle={styles.sheetContent}
    >

    <ScrollView
showsVerticalScrollIndicator={false}
style={className`flex-1`}
contentContainerStyle={className`gap-3`}
>

{/* upper */}
    <View style={className`bg-white px-2 flex flex-col gap-[10px]`}>


<View style={className`flex flex-col gap-[10px] py-3`}>

<View style={className`flex flex-col gap-[10px]`}>

    {/* Title + status on the left, back arrow hard right — same arrangement as
        the driver Manage Ride header. */}
    <View style={className`flex flex-row items-center justify-between`}>
        <View style={className`flex-1 mr-3`}>
            <Text style={className`text-[18px] font-bold text-[#000000]`}>
                Manage Ride
            </Text>
            <Text
                numberOfLines={1}
                style={className`text-[12px] font-bold text-[#AAAAAA] mt-[2px] ${
                    isTerminal && status !== 'COMPLETED' ? 'text-[#DC3545]' : ''
                }`}
            >
                {status === 'COMPLETED' ? 'Trip completed' :
                 status === 'REJECTED' ? 'Booking declined' :
                 status.startsWith('CANCELLED') ? 'Ride cancelled' :
                 config?.label ?? 'Tracking ride...'}
            </Text>
        </View>

        <TouchableOpacity
          accessibilityLabel="Go back"
          onPress={() => route.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-undo-circle-outline" size={20} />
        </TouchableOpacity>
    </View>

    </View>

      <RideStepTracker steps={passengerSteps} />

    <View style={className`flex flex-row items-center gap-3 p-3 w-full bg-[#FAFAFA] rounded-[6px]`}>
                    {/* {<Image source={i} alt='' style={className``} />} */}

 <Text style={className`flex-1`}>
    <Text style={className`text-[#AAAAAA] text-[12px]`}>{isTerminal && status !== 'COMPLETED' ? 'Unfortunately this ride will not be happening. You can search for another ride.' : 'Your safety comes first! Please fasten your seatbelt and enjoy a smooth, secure ride.'}</Text>

 </Text>
                </View>

</View>

</View>

{/* Lower  */}
   <View  style={className`flex flex-col gap-2  py-3 bg-white px-2 `}>

{/* ---- Ride Details ---- */}
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
{/* ---- Driver details ---- */}
<View style={className`w-full flex flex-col gap-3`}>

    <Text style={className`text-[15px] font-bold text-black`}>Driver details</Text>

    <View style={className`w-full flex flex-row items-center gap-3 bg-[#FAFAFA] rounded-[6px] p-3`}>

        {driver?.avatar ? (
            <Image
                source={{ uri: driver.avatar }}
                style={className`w-[50px] h-[50px] rounded-full bg-[#F0F0F0]`}
            />
        ) : (
            <Image
                source={userOne}
                style={className`w-[50px] h-[50px] rounded-full`}
            />
        )}

        <View style={className`flex-1 flex flex-col gap-[2px]`}>

            <Text style={className`text-[15px] font-bold text-black`}>{driverName}</Text>

            {driverRating != null ? (
                <View style={className`flex flex-row items-center gap-1`}>
                    <Ionicons name="star" size={13} color="#F5A623" />
                    <Text style={className`text-[12px] font-bold text-[#A1A1A1]`}>
                        {driverRating.toFixed(1)}
                    </Text>
                </View>
            ) : null}

            {vehicle ? (
                <Text style={className`text-[12px] font-bold text-[#A1A1A1]`}>
                    {[vehicle.color, vehicle.make, vehicle.model, vehicle.year]
                        .filter(Boolean)
                        .join(' · ')}
                </Text>
            ) : null}


        </View>
    </View>
</View>


{status === 'COMPLETED' ? (

/* ---- inline rating: appears when the trip completes ---- */
<View style={className`w-full flex flex-col  bg-white gap-3  pb-5`}>

    <Text style={className`text-[14px] font-bold text-center`}>How was your trip with {' '}
      <Text style={className`text-[#245AB0]`}>{driverName}</Text>?
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
      style={className`w-full min-h-[39px] bg-[#F7F7F7] rounded-lg px-2`}
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
        This ride didn&apos;t work out. Try searching for another one!
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

    {/* Pay Driver now lives in the fixed footer below. */}

    {/* Not needed for now. The mid-trip report has no endpoint behind it, so
        this input only ever looked tappable and did nothing. */}
    {/*
    <Text style={className`text-[12px] font-bold`}>How&apos;s your trip going so far?</Text>

    <View style={className`w-full flex flex-row gap-[10px]`}>

        <View 
           style={className`flex-1 w-full h-[39px] bg-[#F7F7F7] rounded-lg`}>
            <TextInput  
            placeholder='Leave a report ....'
            style={className`w-full h-[39px] bg-[#F7F7F7] rounded-lg`} />
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
    */}

</View>
)}
</View>

</ScrollView>

{/* Pay driver — POST /passenger/bookings/:bookingId/pay. Sits below the
    ScrollView so it stays pinned to the bottom instead of scrolling away. */}
{item?.status === 'IN_PROGRESS' ? (
  <View style={className`w-full bg-white px-2 pt-3 pb-5`}>
    <TouchableOpacity
      onPress={() =>
        route.push({
          pathname: '/(passenger)/payRide/[id]',
          params: { id: rideId ?? '' },
        })
      }
      style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]`}
    >
      <Text style={className`text-white text-[16px] font-bold`}>Pay Driver</Text>
    </TouchableOpacity>
  </View>
) : null}

    </MapSheetScreen>
  )
}

export default TransitRide

const styles = StyleSheet.create({
  sheetContent: {
    // Same gutter as the rides list, so all three passenger screens line up.
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
  },
})
