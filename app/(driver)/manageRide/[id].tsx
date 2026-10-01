import { Alert, Image, ScrollView, StyleSheet, Text,
     TouchableOpacity, View } from  'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import className, { style } from 'twrnc'
import Toast from 'react-native-toast-message'
import Ionicons from '@expo/vector-icons/Ionicons'
import MapSheetScreen from '@/components/MapSheetScreen';
import transit_bg from "../../../assets/images/bg_map_ongoing.png"
import i from "../../../assets/images/i.png"
import down from "../../../assets/images/down.png"
import up from "../../../assets/images/up.png"
import downs from "../../../assets/images/down_arrow.png"
import user from "../../../assets/images/user.png"
import { formatPrice } from '@/lib/formatPrice'
import { useDriverRideStore } from '@/store/driverStore';
import { useAuthStore } from '@/store/authStore';
import RideStepTracker from '@/components/RideStepTracker';
import dayjs from 'dayjs'

// Mirrors BookingStatus in the backend enum (booking-status.enum.ts):
// PENDING | CONFIRMED | CANCELLED_BY_PASSENGER | CANCELLED_BY_DRIVER |
// COMPLETED | REJECTED | NO_SHOW. The three CANCELLED_*/NO_SHOW values were
// missing here, so a cancelled or no-show passenger still showed an active
// "Active Ride" pill and a live dropdown.
const FINISHED_STATUSES = [
  'COMPLETED',
  'REJECTED',
  'NO_SHOW',
  'CANCELLED',
  'CANCELED',
  'CANCELLED_BY_PASSENGER',
  'CANCELLED_BY_DRIVER',
];

const isBookingFinished = (booking: any) =>
  FINISHED_STATUSES.includes(String(booking?.status ?? '').toUpperCase());

const ManageRides = () => {


  const {id} = useLocalSearchParams()


  const {rides} = useDriverRideStore()  
 const data =  rides.find((ride: any) => ride._id === id) 
//  console.log('Manage Ride data:', data)

const router = useRouter()
const { logout } = useAuthStore();

const {getPassengerRides, completeBookingRide} = useDriverRideStore()

const [passengerUser, setPassengerUser] = useState<any>(null);
const[isLoading, setIsLoading] = useState(true);
const [showMenu, setShowMenu] = useState<string | null>(null);
const [showRideMenu, setShowRideMenu] = useState(false);
const [completingId, setCompletingId] = useState<string | null>(null);

// getPassengerRides returns { data: <raw axios body> } and the list lives under
// body.data, so normalise once here instead of at every read site.
const bookings: any[] = useMemo(() => {
  const raw = passengerUser?.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}, [passengerUser]);

const openCount = bookings.filter((b: any) => !isBookingFinished(b)).length;

// Mirrors RideStatus in the backend enum (ride-status.enum.ts):
// SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED. Note there is no PENDING
// ride status — SCHEDULED is the pre-start state.
const rideStatus = String(data?.status ?? 'SCHEDULED').toUpperCase();

const seatsBooked = bookings.reduce(
  (sum: number, b: any) => sum + (Number(b?.seatsBooked) || 0),
  0
);
const totalSeats = Number(data?.initialSeats) || Number(data?.availableSeats) || 0;
const confirmedCount = bookings.filter((b: any) =>
  ['CONFIRMED', 'COMPLETED'].includes(String(b?.status ?? '').toUpperCase())
).length;
const completedCount = bookings.filter(
  (b: any) => String(b?.status ?? '').toUpperCase() === 'COMPLETED'
).length;

const departureLabel = data?.departureTime
  ? dayjs(data.departureTime).format('MMM D, YYYY h:mm A')
  : null;

// Ordered like a shipment tracker: the first step that is not finished is
// where the ride actually is. Nothing here is hardcoded to "in transit" —
// it follows the ride's own status and the bookings' statuses.
const steps = [
  {
    key: 'scheduled',
    label: 'Ride scheduled',
    detail: departureLabel,
    done: true,
  },
  {
    key: 'confirmed',
    label: 'Passengers confirmed',
    detail: totalSeats
      ? `${confirmedCount} of ${totalSeats} seats confirmed`
      : `${confirmedCount} confirmed`,
    done: confirmedCount > 0,
  },
  {
    key: 'transit',
    label: 'In transit',
    detail: 'Heading to drop-off',
    done: rideStatus === 'IN_PROGRESS' || rideStatus === 'COMPLETED',
  },
  {
    key: 'done',
    label: 'Dropped off',
    detail:
      completedCount > 0
        ? `${completedCount} passenger${completedCount === 1 ? '' : 's'} completed`
        : 'Awaiting drop-off',
    done: rideStatus === 'COMPLETED',
  },
];

const activeStep = steps.findIndex((s) => !s.done);

const refreshPassengers = useCallback(async () => {
  if (typeof id !== 'string') return;
  const result = await getPassengerRides(id);
  setPassengerUser(result?.data);
}, [getPassengerRides, id]);


const handleShowMenu = (id:string) => {
  if (typeof id !== 'string') {
    console.error('Invalid ID');
    return;
  }

  setShowMenu(prevId => (prevId === id ? null : id));
}

const handleToggleRideMenu = () => {
  setShowRideMenu((prev) => !prev);
  setShowMenu(null);
};

const handleGoHome = () => {
  setShowRideMenu(false);
  router.replace('/(driver)');
};

const handleLogout = async () => {
  setShowRideMenu(false);
  await logout();
  router.replace('/(auth)');
};

const handleComplete = async (id: string) => {
  // Confirm before hitting the endpoint: completing a booking is not
  // reversible from the driver side, and it used to fire on a single
  // stray tap inside the dropdown.
  Alert.alert(
    'Complete ride?',
    'This marks the ride as finished. Make sure the passenger has been dropped off.',
    [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          setCompletingId(id);
          try {
            const res = await completeBookingRide(id);
            // The action itself already toasts success/failure.
            if (res) {
              // Re-pull so the pill flips to its finished state immediately
              // rather than waiting for the next list refresh.
              await refreshPassengers();
            }
          } finally {
            setCompletingId(null);
            setShowMenu(null);
          }
        },
      },
    ]
  );
};


// "End All Ride" must not strand a passenger: if any booking on this ride is
// still open, refuse and say which ones, instead of navigating away.
const handleEndAll = () => {
  const open = bookings.filter((b: any) => !isBookingFinished(b));

  if (open.length === 0) {
    Alert.alert(
      'Nothing to end',
      'Every passenger on this ride has already completed it.',
      [{ text: 'OK' }]
    );
    return;
  }

  Alert.alert(
    'End ride?',
    open.length === 1
      ? '1 passenger has not completed this ride yet. Ending now will leave their trip open.'
      : `${open.length} passengers have not completed this ride yet. Ending now will leave their trips open.`,
    [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, end ride',
        style: 'destructive',
        onPress: () => {
          Toast.show({
            type: 'error',
            text1: 'Complete each passenger first',
            text2: 'Every passenger must be marked complete before the ride can end.',
          });
        },
      },
    ]
  );
};




useEffect(() => {
    async function fetchPassengerRides(id : string | string[]) {
      setIsLoading(true);
      try {
        if (typeof id === 'string') {
          const result = await getPassengerRides(id); 
          setPassengerUser(result?.data); 
        } else if (Array.isArray(id) && id.length > 0) {
          await getPassengerRides(id[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPassengerRides(id); 
  }, [id, rides]);

  return (
    <MapSheetScreen
      mode="directions"
      origin={data?.originAddress}
      destination={data?.destinationAddress}
      fallback={transit_bg}
      initialRatio={0.7}
      minRatio={0.3}
      maxRatio={0.95}
      showMarker={false}
      sheetBackgroundColor="#FAFAFA"
      sheetContentStyle={styles.sheetContent}
    >

    <ScrollView
showsVerticalScrollIndicator={false}
style={className`flex-1`}
contentContainerStyle={className`gap-3`}
>

{/* Status text left, back arrow hard right. Both sit on the same px-3 gutter
    as the cards below so the header lines up with the rest of the sheet. */}
<View style={className`flex flex-row items-center justify-between px-3 pt-3`}>
  <View style={className`flex flex-row items-center gap-2 relative`}>
    {/* Same markup as the Trip History trigger: text + chevron inside one
        touchable, so the arrow is vertically centred on the text. */}
    <TouchableOpacity
      accessibilityLabel="Menu"
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      onPress={handleToggleRideMenu}
      style={className`flex flex-row items-center gap-2`}
    >
      <Text numberOfLines={1} style={className`text-black text-[16px] font-bold`}>
        {rideStatus === 'COMPLETED'
          ? 'Ride Completed'
          : rideStatus === 'IN_PROGRESS'
          ? 'In Transit'
          : 'Scheduled'}
      </Text>
      <Image source={down} style={className`w-[12px] h-[7px]`} />
    </TouchableOpacity>

    {showRideMenu && (
      <View
        style={className`absolute top-10 right-0 bg-white rounded-[8px] shadow-sm p-2 gap-3
          items-center justify-center flex-col z-100`}
      >
        <TouchableOpacity onPress={handleGoHome}>
          <Text style={className`text-[14px] font-bold`}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout}>
          <Text style={className`text-red-500 font-bold`}>Logout</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>

  <TouchableOpacity
    accessibilityLabel="Go back"
    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    onPress={() => router.back()}
  >
    <Ionicons name="arrow-undo-circle-outline" size={20} />
  </TouchableOpacity>
</View>

{/* upper */}
    <View style={className`bg-white px-2 flex flex-col gap-[10px]`}>

<View style={className`flex flex-col gap-[10px] py-3 `}>

      <RideStepTracker steps={steps} />

{/* Progress strip removed: the grey-to-black gradient, the car image, the
    green bar and the green GPS icon duplicated the RideStepTracker above and
    implied live progress the app does not actually track. */}

    <View style={className`flex flex-row items-center gap-3 p-3 w-full bg-[#FAFAFA] rounded-[6px]`}>
                    <Image source={i} alt=''
 style={className``}   />

 <Text style={className`flex-1`}>
    <Text style={className`text-[#AAAAAA] text-[12px]`}>
      Your safety comes first! Please fasten 
        your seatbelt and enjoy a smooth, secure ride.</Text>

 </Text>
                </View>

</View>

</View>


{/* seperator */}
<View style={className`bg-[#FAFAFA] `}>

</View>
  
  <View style={className`flex flex-col gap-4  p-3 bg-white pt-3 `}>

{/* Where the ride is going. Same row markup as the driver trip list
    (up.png / down_arrow.png, text-[14px] font-bold) so it reads as the same
    card, plus the seat count and price on the date/price row pattern. */}
  <View style={className`flex flex-col gap-1`}>

  {/* Origin */}
  <View style={className`flex flex-row gap-1 pt-3`}>
    <Image source={up} alt='' style={className``} />
    <Text numberOfLines={2} style={className`text-[14px] font-bold`}>
      {data?.originAddress ?? '—'}
    </Text>
  </View>

  {/* Time and Price — sits between the two locations */}
  <View style={className`flex flex-row items-center gap-3 mt-3`}>
    <View
      style={className`rounded-lg flex items-center justify-center
        h-[32px] px-2 self-start bg-[#F0F0F0]`}
    >
      <Text
        numberOfLines={1}
        style={className`text-[12px] font-bold text-[#8C8C8C]`}
      >
        {departureLabel ?? 'Time not set'}
      </Text>
    </View>

    <View style={className`flex-1 h-[2px] bg-[#ECECEC]`} />

    <Text
      numberOfLines={1}
      style={className`text-[#008000] text-sm font-semibold`}
    >
      ₦{formatPrice(data?.pricePerSeat)}
    </Text>
  </View>

  {/* Destination — where he or she is heading */}
  <View style={className`flex flex-row gap-1 py-3`}>
    <Image source={downs} alt='' style={className``} />
    <Text numberOfLines={2} style={className`text-[14px] font-bold`}>
      {data?.destinationAddress ?? '—'}
    </Text>
  </View>

  {/* Seats booked — at the bottom */}
  <View style={className`flex flex-row items-center justify-between px-2`}>
    <Text style={className`font-bold text-[#AAAAAA] text-[14px]`}>
      Seats booked
    </Text>
    <Text numberOfLines={1} style={className`text-[14px] font-bold`}>
      {seatsBooked}
      {totalSeats ? ` of ${totalSeats}` : ''}
    </Text>
  </View>
</View>

{/* Ride details */}

   <Text style={className`text-black font-bold text-base`}>Ride Details</Text>
    
       

  <View style={className`flex flex-col gap-2`}>

    <View className='flex flex-col gap-4'>


  {bookings.length > 0 ? (
  bookings.map((booking: any, index: number) => (
    <View
      key={index}
      style={className`flex flex-row items-center justify-between py-2`}
    >
      {/* Passenger Info */}
      <View style={className`flex flex-row gap-3 items-center flex-1`}>
        <Image source={user} style={className`rounded-full w-10 h-10`} />

        <View style={className`flex-1`}>
          <Text numberOfLines={1} style={className`font-bold text-sm`}>
            {booking.passenger.firstName} {booking.passenger.lastName}
          </Text>

          {/* Only surface a per-passenger drop-off when it actually differs
              from the ride destination already shown in Ride details, so the
              same location is not printed twice. */}
          {booking.dropoffAddress &&
          booking.dropoffAddress !== data?.destinationAddress ? (
            <Text numberOfLines={1} style={className`text-[12px] text-[#AAAAAA] mt-[2px]`}>
              {booking.dropoffAddress}
            </Text>
          ) : null}
          <Text numberOfLines={1} style={className`text-[12px] text-[#AAAAAA]`}>
            {booking.seatsBooked ?? 1} seat
            {(booking.seatsBooked ?? 1) === 1 ? '' : 's'}
            {booking.totalPrice != null
              ? `  •  ₦${formatPrice(booking.totalPrice)}`
              : ''}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={className`flex flex-row gap-2 items-center relative`}>
        {/* Status as plain text — grey once the booking is finished, green while live */}
        <Text
          numberOfLines={1}
          style={className`text-sm font-bold ${
            isBookingFinished(booking) ? 'text-[#9CA3AF]' : 'text-[#28A745]'
          }`}
        >
          {isBookingFinished(booking) ? 'Completed' : 'Active Ride'}
        </Text>

        {/* Dropdown Trigger */}
        <TouchableOpacity
          accessibilityLabel="Booking options"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          disabled={isBookingFinished(booking)}
          onPress={() => handleShowMenu(booking._id)}
        >
          <View
            style={[className`flex flex-row gap-1 items-center justify-center w-10 h-10 border-[1px] border-[#EAEAEA]`,
       {backgroundColor: isBookingFinished(booking) ? '#9CA3AF' : '#22C55E'}
            ]}
          >
            <Image source={down} style={className`w-[12px] h-[7px]`} />
          </View>
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {showMenu === booking._id && (
          <View
            style={className`
              absolute top-10 left-0 bg-white rounded-[8px] shadow-sm p-2 gap-3 
              items-center justify-center flex-col w-full z-10
            `}
          >
            <TouchableOpacity
              disabled={completingId === booking._id}
              onPress={() => handleComplete(booking._id)}
            >
              <View style={className`border-b border-gray-200`}>
                {completingId === booking._id ? (
                  <Text className='text-[14px] font-bold text-[#AAAAAA]'>Completing…</Text>
                ) : (
                  <Text className='text-[14px] font-bold text-black'>Complete Ride</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={() => handleCancel(booking._id)}>
              <Text
                style={className`text-red-500 font-bold hover:text-red-300`}
              >
                Cancel ride
              </Text>
            </TouchableOpacity> */}

          </View>
        )}
      </View>
    </View>
  ))
) : (
  <View>
    <Text style={className`text-center text-gray-500`}>
      No passengers available
    </Text>
  </View>
)}


    </View>

  </View>

{/* button */}

<View style={className`flex flex-col gap-2`}>

      {/* Button */}
  <View style={className`w-full flex items-center justify-center`}>
    <TouchableOpacity
      onPress={handleEndAll}
      disabled={bookings.length === 0}
      style={className`w-full h-[46px] flex items-center justify-center rounded-[6px] ${bookings.length === 0 ? 'bg-[#9CA3AF]' : 'bg-[#DC3545]'}`}
    >
      <Text style={className`text-white text-[16px]`}>
        {bookings.length === 0
          ? 'End All Ride'
          : openCount === 0
            ? 'End All Ride'
            : `End All Ride (${openCount} pending)`}
      </Text>
    </TouchableOpacity>
  </View>



    
</View>

</View>


</ScrollView>
    </MapSheetScreen>
  )
}

export default ManageRides

const styles = StyleSheet.create({
  sheetContent: {
    gap: 8,
  },
})
