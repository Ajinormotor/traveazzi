import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput,
     TouchableOpacity, View, Modal } from  'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { riderListData } from '@/constants/data/riderList'
import className, { style } from 'twrnc'
import transit_bg from "../../../assets/images/bg_map_ongoing.png"
import down from "../../../assets/images/down.png"
import { usePassengerStore } from '@/store/passengerStore'
import { useDriverRideStore } from '@/store/driverStore'
import MapSheetScreen from '@/components/MapSheetScreen'
import Ionicons from '@expo/vector-icons/Ionicons'
import userOne from "../../../assets/images/user_logo img (1).png"
import dayjs from 'dayjs'
import { formatPrice } from '@/lib/formatPrice'
import up from "../../../assets/images/up.png"
import downs from "../../../assets/images/down_arrow.png"
import RideStepTracker, { type RideStep } from '@/components/RideStepTracker'
import { getDriverName } from '@/lib/driver'
const RATING_FACES = [
  { icon: '😍', label: 'Loved it' },
  { icon: '🙂', label: 'Good' },
  { icon: '😐', label: 'Okay' },
  { icon: '🙁', label: 'Bad' },
  { icon: '😞', label: 'Terrible' },
];

const PayRide = () => {
const { id } = useLocalSearchParams();
const route = useRouter();
const { rides, singleRides } = useDriverRideStore();
const { payBookings, getMyBookings, closeRide, submitRating } = usePassengerStore();
const [rideDetails, setRideDetails] = useState<any>(null);
const [isLoading, setIsLoading] = useState(false);
const [showReport, setShowReport] = useState(false);

// Ending the trip, then rating the driver.
const [booking, setBooking] = useState<any>(null);
const [bookingId, setBookingId] = useState<string | null>(null);
const [showEndConfirm, setShowEndConfirm] = useState(false);
const [isEnding, setIsEnding] = useState(false);
const [showRating, setShowRating] = useState(false);
const [ratingDismissed, setRatingDismissed] = useState(false);
const [ratingScore, setRatingScore] = useState(0);
const [ratingComment, setRatingComment] = useState('');
const [submittingRating, setSubmittingRating] = useState(false);
const [tripEnded, setTripEnded] = useState(false);
useEffect(() => {
  const fetchingSingleRide = async () => {
    const rideId = Array.isArray(id) ? id[0] : id ?? '';
    const result = await singleRides(rideId);
    setRideDetails(result);
  };
  fetchingSingleRide();
}, [id, singleRides]);

// The ride alone is not enough here: ending the trip and rating the driver both
// act on this passenger's booking, not on the ride.
useEffect(() => {
  const rideId = Array.isArray(id) ? id[0] : id ?? '';
  if (!rideId) return;
  let cancelled = false;
  const findBooking = async () => {
    const list = await getMyBookings({ silent: true });
    if (cancelled || !Array.isArray(list)) return;
    const match = list.find((b: any) => String(b?.ride?._id ?? b?.rideId) === rideId);
    if (!match) return;
    setBooking(match);
    setBookingId(match._id ?? null);
  };
  findBooking();
  return () => { cancelled = true; };
}, [id, getMyBookings]);

// The driver completes the trip from their own screen, so this screen has to
// re-read the ride whenever it comes back to the front — otherwise the End
// Ride button and the step tracker would sit on stale data.
useFocusEffect(
  useCallback(() => {
    const rideId = Array.isArray(id) ? id[0] : id ?? '';
    if (!rideId) return;
    let cancelled = false;
    const refresh = async () => {
      const result = await singleRides(rideId);
      if (!cancelled) setRideDetails(result);
    };
    refresh();
    return () => { cancelled = true; };
  }, [id, singleRides]),
);
// console.log('Pay Ride Details', rideDetails)

// The old 500ms timer used to pop the report prompt open on arrival. That
// prompt is commented out, so the timer is gone with it; `showReport` is kept
// only because the commented block still references it.

if (!rideDetails) return <View style={[className`flex-1 items-center justify-center`]}> <ActivityIndicator size={40}  color="#000"  /></View>; 
const item = rideDetails;

const DEPARTURE_LABEL = item?.departureTime
  ? dayjs(item.departureTime).format('MMM D, YYYY · h:mm A')
  : '—';

// The API populates `driver` (firstName, lastName, avatar,
// averageRatingAsDriver) and `vehicle` on a single ride.
const driver = item?.driver;
const vehicle = item?.vehicle;
const driverName = getDriverName(driver, 'Your driver');
const driverRating =
  typeof driver?.averageRatingAsDriver === 'number' ? driver.averageRatingAsDriver : null;

const totalSeats = Number(item?.initialSeats) || Number(item?.availableSeats) || 0;

const seatsBooked = Number(
  booking?.seatsBooked ?? Math.max(0, (item?.initialSeats ?? 0) - (item?.availableSeats ?? 0)),
) || 0;

// Same four steps the driver sees, driven by the ride's real status. CONFIRMED,
// IN_PROGRESS and COMPLETED are order-preserving, so "at least" works.
const ACCEPTED_STATES = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
const rideStatus = String(item?.status ?? '');
const bookingStatus = String(booking?.status ?? '');
// The driver's "Complete Ride" action marks the passenger's *booking*
// complete; nothing ever writes RideStatus.COMPLETED. So the trip is finished
// when either signal says so, otherwise a passenger whose ride was completed
// would land here still seeing a live trip and a disabled End Ride button.
const driverCompleted =
  rideStatus === 'COMPLETED' || bookingStatus === 'COMPLETED';
const effectiveStatus = driverCompleted ? 'COMPLETED' : rideStatus;

// The last reached step, so a completed booking also lights up "In transit"
// even when the ride row itself never left IN_PROGRESS.
const reached = (states: string[]) => states.includes(effectiveStatus);

const journeySteps: RideStep[] = [
  {
    key: 'scheduled',
    label: 'Ride scheduled',
    detail: DEPARTURE_LABEL,
    done: true,
  },
  {
    key: 'accepted',
    label: 'Driver accepted',
    detail: reached(ACCEPTED_STATES) ? `${driverName} is on the way` : 'Waiting for a driver to accept',
    done: reached(ACCEPTED_STATES),
  },
  {
    key: 'transit',
    label: 'In transit',
    detail: reached(['IN_PROGRESS', 'COMPLETED'])
      ? 'Enjoy your trip'
      : 'Starts at the departure time',
    done: reached(['IN_PROGRESS', 'COMPLETED']),
  },
  {
    key: 'done',
    label: 'Dropped off',
    detail: driverCompleted ? 'Delivery confirmed' : 'Awaiting driver confirmation',
    done: driverCompleted,
  },
];

// The trip is live while the ride is IN_PROGRESS and this passenger's booking
// has not been cancelled, completed or rejected. The backend enum has no plain
// 'CANCELLED': it splits into CANCELLED_BY_DRIVER / CANCELLED_BY_PASSENGER.
const TERMINAL_BOOKING_STATUSES = [
  'COMPLETED',
  'REJECTED',
  'NO_SHOW',
  'CANCELLED_BY_DRIVER',
  'CANCELLED_BY_PASSENGER',
];
const bookingLive =
  item?.status === 'IN_PROGRESS' &&
  !!bookingId &&
  !TERMINAL_BOOKING_STATUSES.includes(booking?.status ?? '');

// Only the driver confirms the delivery. The button is always there so the
// reason is visible, but it stays disabled and grey until the ride is
// actually COMPLETED.
const canRate = driverCompleted && !!bookingId;


const handleEndRide = async () => {
  if (!item?._id) return;
  setIsEnding(true);
  // Close the ride itself, not just the booking. endBooking could not work
  // here: the driver has already confirmed delivery, so the booking is
  // COMPLETED and that endpoint rejected the state.
  const ok = await closeRide(item._id);
  setIsEnding(false);
  if (!ok) return;

  setShowEndConfirm(false);
  setTripEnded(true);
  setRatingDismissed(false);
  setShowRating(true);
};

const handleSubmitRating = async () => {
  if (!bookingId) return;
  setSubmittingRating(true);
  const ok = await submitRating(bookingId, ratingScore, ratingComment.trim() || undefined);
  setSubmittingRating(false);
  if (!ok) return;

  // Closing the modal is not enough on its own. The modal's visibility is
  // derived -- `canRate && !ratingDismissed && !tripEnded` -- so clearing
  // showRating alone left that expression true and the modal stayed open.
  // Retire the trip so the derived condition goes false and stay dismissed,
  // otherwise reopening this screen would pop the modal straight back up for a
  // driver the API now rejects as already rated.
  setShowRating(false);
  setRatingDismissed(true);
  setTripEnded(true);
};
const handlePay = async () => {
  await payBookings(item._id);
  route.push('/(passenger)/home')
};
  return (
    // Real map rather than the static image. MapSheetScreen renders MapEmbed,
    // which loads the Google Maps Embed API in a WebView and only falls back to
    // the bundled image when the key is missing or the request is refused.
    <MapSheetScreen
      mode="directions"
      origin={item?.originAddress}
      destination={item?.destinationAddress}
      fallback={transit_bg}
      initialRatio={0.62}
      minRatio={0.3}
      maxRatio={0.95}
      showMarker={false}
      sheetBackgroundColor="#FFFFFF"
      sheetContentStyle={styles.sheetContent}
    >
    <ScrollView
showsVerticalScrollIndicator={false}
style={className`flex flex-col gap-3`}
>
{/* Title left, back arrow hard right, matching Manage Ride. The Flash icon
    and the drag-handle bar are gone: the icon implied a live speed reading the
    API never provides, and the handle sat above a sheet that is not draggable
    here. */}
<View style={className`bg-white px-3 flex flex-col gap-[10px]`}>
  <View style={className`flex flex-row items-center justify-between py-3`}>
    <View style={className`flex-1 mr-3`}>
      <Text style={className`text-[18px] font-bold text-[#000000]`}>
        {effectiveStatus === 'COMPLETED' ? 'Journey Completed' : 'Journey Underway'}
      </Text>
      <Text
        numberOfLines={1}
        style={className`text-[12px] font-bold text-[#AAAAAA] mt-[2px]`}
      >
        {item?.status === 'COMPLETED'
          ? 'This trip has been completed.'
          : 'Your trip is on the way.'}
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

{/* Same four-step tracker the driver sees, so both sides read the trip the
    same way: scheduled, accepted, in transit, dropped off. */}
<View style={className`w-full flex flex-col gap-3 bg-[#FAFAFA] rounded-[6px] p-3`}>
  <RideStepTracker steps={journeySteps} />
</View>

{/* ---- Ride Details ---- */}
<View style={className`w-full flex flex-col gap-3 bg-[#FAFAFA] rounded-[6px] p-3`}>
  <Text style={className`text-[15px] font-bold text-black`}>Ride Details</Text>

  <View style={className`flex flex-col gap-2`}>
  <View style={className`flex flex-row gap-2`}>
    <Image source={up} alt='' style={className`mt-[2px]`} />
    <Text numberOfLines={2} style={className`text-[14px] font-bold flex-1`}>
      {item?.originAddress ?? '—'}
    </Text>
  </View>

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
{/* ---- Trip Summary: plate number and driver card, matching Manage Ride ---- */}
<View style={className`w-full flex flex-col gap-3`}>

    <Text style={className`text-[15px] font-bold text-black`}>Trip Summary</Text>

    <View style={className`w-full flex flex-col gap-3 bg-[#FAFAFA] rounded-[6px] p-3`}>

        <View style={className`flex flex-row items-center gap-3`}>
            {driver?.avatar ? (
                <Image
                    source={{ uri: driver.avatar }}
                    style={className`w-[50px] h-[50px] rounded-full bg-[#F0F0F0]`}
                />
            ) : (
                <Image source={userOne} style={className`w-[50px] h-[50px] rounded-full`} />
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
<View style={className`w-full flex flex-col  bg-white  gap-4 mt-4`}>
    {/* <View>
        <Text style={className`text-[16px]  font-bold`}>Trip preference</Text>
    </View> */}
{/* Commented out: the mid-trip report prompt is not needed, and it was never
    wired anyway — the Submit button had no handler that reached an endpoint,
    so it looked tappable and did nothing. Rating the driver now happens in a
    modal after the trip ends instead.
{
    showReport &&
    <View style={className`flex flex-col gap-3`}>
        <Text style={className`text-black font-bold text-base`}>
            How is  your ride going?
        </Text>
<View style={className`flex flex-row gap-3`}>
    {
  emoji.map((emoj, index) => (
    <View key={index} style={className`bg-[#F9F9F9] px-1 py-2 w-[64px] h-[69px] flex flex-col items-center justify-center`}>
      <Text style={{ fontSize: 20 }}>{emoj.icon}</Text>
      <Text style={className`text-sm text-black`}>{emoj.label}</Text>
    </View>
  ))
}
</View>
   <View style={className`flex-1 w-full flex-row gap-3`}>
  
  <View style={className`flex-1 h-[47px] bg-[#F7F7F7] rounded-lg p-1`}>
    <TextInput  
      placeholder='Leave a report ....'
      style={className`w-full h-full bg-[#F7F7F7] rounded-lg px-2 `} 
    />
  </View>
  <TouchableOpacity 
  onPress={handleShowReport}
    style={className`w-[100px] h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]`}>
    <Text style={className`text-white text-[16px]`}>Submit</Text>
  </TouchableOpacity>
</View>
    </View>
}
*/}
</View>
 { item?.status === 'COOMPLETED' &&    <View style={className`flex flex-row gap-1 `}>
        <TouchableOpacity  onPress={() => setShowReport(!showReport)}
         style={className`bg-[#245AB0] w-[271px] h-[44px] flex items-center justify-center rounded-lg`}>
            <Text style={className`text-white`}>Pay Now</Text>
        </TouchableOpacity>
        <View style={className`flex flex-row items-center justify-center border-[1px] border-[#E4EFFF]
            w-[85px] h-[44px] gap-1 rounded-r-lg`}>
        <Text style={className`text-black text-[14px]`}>Cash</Text>
        <Image source={down} alt=''
        style={className`w-[12px] h-[7px]`}  />
            
        </View>
    </View>
}
   
</ScrollView>

{/* Pinned below the sheet so it never scrolls out of reach. The driver owns the
    end of the trip, so this stays grey and disabled until the ride reads
    COMPLETED — it is kept visible so the reason is obvious rather than the
    button silently vanishing. */}
{bookingLive || canRate ? (
  <View style={className`w-full bg-white px-3 pt-3 pb-5`}>
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: !canRate }}
      disabled={!canRate || isEnding}
      onPress={() => setShowEndConfirm(true)}
      style={className`w-full h-[48px] flex items-center justify-center rounded-[6px] ${
        canRate ? 'bg-[#E02020]' : 'bg-[#B4B4B4]'
      }`}
    >
      {isEnding ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={className`text-white text-[16px] font-bold`}>End Ride</Text>
      )}
    </TouchableOpacity>

    {!canRate ? (
      <Text
        style={className`text-[12px] font-bold text-[#AAAAAA] text-center mt-2`}
      >
        Your driver confirms your delivery to end the trip.
      </Text>
    ) : null}
  </View>
) : null}

{/* Confirm first: from here the trip cannot be resumed. */}
<Modal
  visible={showEndConfirm}
  transparent
  animationType="fade"
  onRequestClose={() => setShowEndConfirm(false)}
>
  <View style={className`flex-1 bg-black/50 items-center justify-center px-6`}>
    <View style={className`w-full bg-white rounded-2xl p-5`}>
      <Text style={className`text-[17px] font-bold text-black`}>Finish this ride?</Text>
      <Text style={className`text-[14px] text-[#555] mt-2`}>
        Your driver confirmed your delivery. You will be asked to rate them.
      </Text>
      <View style={className`flex flex-row gap-3 mt-5`}>
        <TouchableOpacity
          onPress={() => setShowEndConfirm(false)}
          style={className`flex-1 h-[46px] border border-[#E4E4E4] rounded-[6px] flex items-center justify-center`}
        >
          <Text style={className`text-[15px] font-bold text-black`}>Not yet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={isEnding}
          onPress={handleEndRide}
          style={className`flex-1 h-[46px] bg-[#E02020] rounded-[6px] flex items-center justify-center`}
        >
          <Text style={className`text-white text-[15px] font-bold`}>Finish</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

{/* Rate the driver, then go home. */}
<Modal
  visible={showRating || (canRate && !ratingDismissed && !tripEnded)}
  transparent
  animationType="slide"
  onRequestClose={() => { setShowRating(false); setRatingDismissed(true); }}
>
  <View style={className`flex-1 bg-black/50 items-center justify-center px-6`}>
    <View style={className`w-full bg-white rounded-2xl p-5`}>
      <Text style={className`text-[17px] font-bold text-black`}>How was your trip?</Text>
      <Text style={className`text-[13px] text-[#777] mt-1`}>
        Your feedback helps other riders.
      </Text>

      <View style={className`flex flex-row justify-between mt-4`}>
        {RATING_FACES.map((face, faceIndex) => {
          const value = faceIndex + 1;
          const selected = ratingScore === value;
          return (
            <TouchableOpacity
              key={face.label}
              accessibilityLabel={face.label}
              accessibilityRole="button"
              onPress={() => setRatingScore(value)}
              style={className`w-[58px] h-[66px] rounded-lg items-center justify-center ${
                selected ? 'bg-[#EAF1FB] border border-[#245AB0]' : 'bg-[#F9F9F9]'
              }`}
            >
              <Text style={{ fontSize: 22 }}>{face.icon}</Text>
              <Text
                numberOfLines={1}
                style={className`text-[10px] mt-[2px] ${
                  selected ? 'text-[#245AB0] font-bold' : 'text-[#666]'
                }`}
              >
                {face.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={className`w-full h-[46px] bg-[#F7F7F7] rounded-lg px-3 mt-4 justify-center`}>
        <TextInput
          value={ratingComment}
          onChangeText={setRatingComment}
          placeholder="Add a comment (optional)"
          placeholderTextColor="#999"
          style={className`w-full text-[14px]`}
        />
      </View>

      {/* Offered only once the ride has actually ended. */}
      {tripEnded ? (
        <TouchableOpacity
          onPress={() => route.replace('/(passenger)/home')}
          style={className`w-full h-[48px] bg-[#245AB0] rounded-[6px] flex items-center justify-center mt-4`}
        >
          <Text style={className`text-white text-[15px] font-bold`}>Back to Home</Text>
        </TouchableOpacity>
      ) : null}

      <View style={className`flex flex-row gap-3 mt-3`}>
        <TouchableOpacity
          onPress={() => { setShowRating(false); setRatingDismissed(true); }}
          style={className`flex-1 h-[46px] border border-[#E4E4E4] rounded-[6px] flex items-center justify-center`}
        >
          <Text style={className`text-[15px] font-bold text-black`}>Not now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!ratingScore || submittingRating}
          onPress={handleSubmitRating}
          style={className`flex-1 h-[46px] rounded-[6px] flex items-center justify-center ${
            ratingScore && !submittingRating ? 'bg-[#245AB0]' : 'bg-[#B9C4D4]'
          }`}
        >
          {submittingRating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={className`text-white text-[15px] font-bold`}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </MapSheetScreen>
  )
}
export default PayRide
const styles = StyleSheet.create({
  // Matches the rides list so every passenger screen lines up on the same gutter.
  sheetContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
})