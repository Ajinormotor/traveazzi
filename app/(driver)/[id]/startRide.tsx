import { ActivityIndicator, Image, ScrollView, StyleSheet,
     Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import bg from "../../../assets/images/map_bg.png"
import className, { style } from 'twrnc'
import MapSheetScreen from '@/components/MapSheetScreen';
import down from "../../../assets/images/down.png"
import cancel from "../../../assets/images/cancel.png"
import Ionicons from '@expo/vector-icons/Ionicons'
import { useLocalSearchParams, useRouter, Link } from 'expo-router'
import Toast from 'react-native-toast-message'

import downArrow from "../../../assets/images/down_arrow.png"
import up from "../../../assets/images/up.png"
import dayjs from 'dayjs';
import { formatPrice } from '@/lib/formatPrice'



const StartRide = () => {
const router = useRouter()


  const {id} = useLocalSearchParams()

  // console.log('Mange Id details:', id)
  const {rides, getAllRides} = useDriverRideStore()  

const rideDetails: RidePayload | null = useMemo(() => {
  const key = Array.isArray(id) ? id[0] : id;
  if (!key) return null;
  return (rides.find((ride: any) => ride._id === key) as RidePayload) ?? null;
}, [id, rides]);


  const data =  rides.find((ride: any) => ride._id === id)   

const {startRides,loading} = useDriverRideStore() 

const handleSubmit = async () => {
  //  router.push(`/manageRide/${id}`);
 if (typeof id !== 'string') {
    console.error('Invalid ID');
    return;
  }

  const success = await startRides(id);
   await getPassengerRides(id)
   await getAllRides()



  if(success) {
  setTimeout(() => {
  router.push(`/(driver)/manageRide/${id}`);

  }, 100);  

}
};

const [showMenu, setShowMenu] = useState(false)

const handleLogout = async() => {
  await logout()
  setShowMenu(!showMenu)
  router.push('/(auth)')

}

const {getPassengerRides, acceptPassengerRides,
   rejectPassengerRides} = useDriverRideStore()

const {logout} = useAuthStore()

const handleToggle = () => {
  setShowMenu(!showMenu)
}

const [passengerUser, setPassengerUser] = useState<any>(null);
const[isLoading, setIsLoading] = useState(true);  



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

// console.log('Start Ride Passenger User:', passengerUser);

// A single id made Accept and Reject show their spinner together, because both
// buttons test `actionId === booking._id`. Track the action too so only the
// button that was actually tapped spins.
const [pendingAction, setPendingAction] = useState<{
  id: string;
  type: 'accept' | 'reject';
} | null>(null);

const isPending = (bookingId: string, type: 'accept' | 'reject') =>
  pendingAction?.id === bookingId && pendingAction.type === type;
const isBusy = (bookingId: string) => pendingAction?.id === bookingId;

const refetchPassengers = async () => {
  const rideId = Array.isArray(id) ? id[0] : id;
  if (typeof rideId !== 'string') return;
  try {
    const result = await getPassengerRides(rideId);
    if (result?.data) setPassengerUser(result.data);
  } catch (err) {
    console.error(err);
  }
};

const handleReject = async(bookingId: string) => {
  if (pendingAction) return;
  setPendingAction({ id: bookingId, type: 'reject' });
  try {
    await rejectPassengerRides(bookingId)
    await refetchPassengers()
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: error?.response?.data?.message ?? error?.message ?? 'Failed to reject ride',
    });
  } finally {
    setPendingAction(null)
  }
}


const handleAccept = async(bookingId: string) => {
  if (pendingAction) return;
  setPendingAction({ id: bookingId, type: 'accept' });
  try {
    await acceptPassengerRides(bookingId)
    await refetchPassengers()
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: error?.response?.data?.message ?? error?.message ?? 'Failed to accept ride',
    });
  } finally {
    setPendingAction(null)
  }
}


  return (
<MapSheetScreen
  mode="directions"
  origin={data?.originAddress}
  destination={data?.destinationAddress}
  fallback={bg}
  initialRatio={0.8}
  minRatio={0.3}
  maxRatio={0.95}
  showMarker
  sheetBackgroundColor="#FFFFFF"
  sheetContentStyle={styles.sheetContent}
>

<ScrollView  
showsVerticalScrollIndicator={false}
showsHorizontalScrollIndicator={false}
style={className`flex-1`}
contentContainerStyle={className`gap-3 pb-3`}>



<View  style={className` flex flex-col gap-4`}>


     <View style={className`flex flex-row items-start justify-between mt-2 z-100`}>


          <View style={className`flex flex-col items-center 
            justify-start gap-2  relative`}>
    <View style={className`flex flex-row gap-2 `}>

        <TouchableOpacity onPress={handleToggle} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={className`flex flex-row items-center gap-1 py-2`}>
          <Text style={className`text-2xl  font-bold ml-[-32px]`}>
            Manage ride</Text>
          <Image source={down} alt=''
        style={className`w-[12px] h-[7px] `}  />
        </TouchableOpacity>
     
      </View>

         <Text style={className`text-[14px] text-[#AAAAAA] font-bold mt-[-8px]`}>
          Manage your trip and requests.</Text>



{showMenu && (
  <View style={className`
    absolute top-10 left-0 bg-white rounded-[8px] shadow-sm p-2 gap-3 
    items-center justify-center flex-col w-full z-100
    ${showMenu ? 'flex' : 'hidden'}
  `}>
    <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
      <Link href="/(driver)/vehicle"
      style={className`border-b border-gray-200`}>
      <Text className='text-[14px] font-bold text-black'>Vehicle</Text>
       </Link>
    </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
      <Link href="/(driver)/profile"
      style={className`border-b border-gray-200`}>
      <Text className='text-[14px] font-bold text-black'>Profile</Text>
       </Link>
    </TouchableOpacity>

       <TouchableOpacity onPress={handleLogout}>
    
      <Text style={className`text-red-500 font-bold hover:text-red-300 `}>
        Logout
        </Text>
      
    </TouchableOpacity>
  </View>
)}

    </View>


      {/* <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-2xl  font-bold`}>Manage ride</Text>
        <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>Manage your trip and requests.</Text>
      </View> */}


     <TouchableOpacity
                    onPress={() => router.back()}>
                  {/* <Image source={cancel} style={className`w-[20px] h-[20px]`} /> */}
                     <Ionicons name="arrow-undo-circle-outline"  size={20} />
                </TouchableOpacity>

     </View>


  
  <View style={className`flex flex-col gap-4  `}>

{/* Ride details */}
        <View style={className`px-2`} >
        
        <Text style={className`text-black font-bold text-base`}>Ride Details</Text>

  <View
                        style={className`border border-[#EBEBEB] rounded-[8px] bg-white mt-2`}
                      >
                <View  style={className`flex flex-col bg-white  `}>
        
            
                <View style={className`flex flex-row 
                 items-center justify-between gap-[10px] w-full  px-2`}>
        
        <View style={className`flex flex-col gap-1 py-4`}>
        
        <View style={className`flex flex-row gap-1`}>
            <Image source={up}  alt=""
            style={className``}  />
            <Text style={className`text-[14px] font-bold`}>{data?.originAddress ?? ''}</Text>
        </View>

        {/* Duplicate of the destination that sits below the arrow. The arrow row
            further down already prints it, so this copy is commented out. */}
        {/* <Text style={className`text-[12px] font-bold text-[#434343]`}>
          {data?.destinationAddress  ?? ''}
        </Text> */}
        </View>
        
      
        
        
                </View>

                </View>


{/* Seperator with time */}
                <View style={className`flex flex-row items-center gap-2 px-2`}>
                  <Text
                    numberOfLines={1}
                    style={className`text-[#8C8C8C] text-sm`}
                  >
                    {dayjs(data?.departureTime).format('MMM D, h:mm A')}
                    </Text>
                  <View style={className`flex-1 border-[#ECECEC] border-[2px] h-[2px]`}></View>
                  <Text numberOfLines={1} style={className`text-[#008000] text-sm font-bold`}>
                    {data?.pricePerSeat != null
                      ? `₦${formatPrice(data.pricePerSeat)}`
                      : '—'}
                  </Text>
                </View>

                 <View  style={className`flex flex-col bg-white  `}>
        
            
                <View style={className`flex flex-row 
                 items-center justify-between gap-[10px] w-full  px-2`}>
        
        <View style={className`flex flex-col gap-1 py-4`}>
        
        <View style={className`flex flex-row gap-1`}>
            <Image source={downArrow}  alt=""
            style={className``}  />
            <Text style={className`text-[14px] font-bold`}>
                   {data?.destinationAddress }
            </Text>
        </View>

        {/* Duplicate of the destination printed right above this row. */}
        {/* <Text style={className`text-[12px] font-bold text-[#434343]`}>
               {data?.destinationAddress }</Text> */}
        </View>
        
       
        
                </View>
       
        
    
             
        
                </View>
      </View>

        </View>

        

  <View style={className`flex flex-col gap-2 px-2`}>

    {/* passengers */}

{passengerUser?.data && passengerUser.data.length > 0 ? (

<View style={[className`flex flex-col gap-2`]}>

       <Text style={className`text-black font-bold text-base mb-2`}>Passengers</Text>

  <View className='flex flex-col gap-4'>
    {passengerUser.data.map((booking: any) => (
      <View key={booking._id} style={className`flex flex-row items-center justify-between py-2`}>
      
        <View style={className`flex flex-row gap-3 items-center`}>
          <Image source={user} style={className`rounded-full w-10 h-10`} />
          <Text style={className`font-bold text-sm`}>
            {booking.passenger.firstName} {booking.passenger.lastName}
          </Text>
    
    
        </View>


{/* Acceppt /reject Button */}
{ booking.status === 'PENDING' &&
<View

  style={[ className`flex flex-row gap-2 items-center `]}
>

         <TouchableOpacity onPress={() => handleReject(booking._id)} disabled={isBusy(booking._id)}>
         
          <View style={className`flex flex-row items-center justify-center bg-[#DC3545] w-[71px] h-[35px] rounded-[8px] ${isPending(booking._id, 'reject') ? 'opacity-60' : ''}`}>
            {isPending(booking._id, 'reject') ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={className`text-white text-sm font-bold`}>Reject</Text>
            )}
          </View>
           </TouchableOpacity> 
           

  <TouchableOpacity onPress={() => handleAccept(booking._id)} disabled={isBusy(booking._id)}>


          <View style={className`flex flex-row items-center justify-center bg-[#28A745] w-[71px] h-[35px] rounded-[8px] ${isPending(booking._id, 'accept') ? 'opacity-60' : ''}`}>
            {isPending(booking._id, 'accept') ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={className`text-white text-sm font-bold`}>Accept</Text>
            )}
          </View>

          </TouchableOpacity>
          
        </View>
    }
        
      </View>
    ))}
  </View>

  </View>
) : (
<View style={[className`flex flex-col gap-2`]}>

       <Text style={className`text-black font-bold text-base text-start mb-2`}>Passengers</Text>

    <Text style={className`text-center text-gray-500`}>No passengers available</Text>
  </View>
)
}


  </View>



</View>

 

     </View>

    </ScrollView>


    {/* button */}
{rideDetails?.status !== "COMPLETED" && rideDetails?.status !== "CANCELLED" && (
  <View style={className`flex flex-col gap-2`}>

    {/* Start or Continue Button */}
    <View style={className`w-full flex items-center justify-center`}>

      <TouchableOpacity
      onPress={() => 
  rideDetails?.status === "SCHEDULED" 
    ? handleSubmit() 
    : router.push(`/(driver)/manageRide/${id}`)
}

        style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]`}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={className`text-white text-[16px]`}>
            {rideDetails?.status === "SCHEDULED" ? "Start Ride" : "Continue Ride"}
          </Text>
        )}
      </TouchableOpacity>

    </View>

    {/* Cancel Button */}
    <View style={className`w-full flex items-center justify-center`}>
      <TouchableOpacity onPress={() => router.back()}
        style={className`w-full h-[46px] bg-[#F0F0F0] flex items-center justify-center rounded-[6px]`}>
        <Text style={className`text-[#FF0000] text-[16px]`}>Cancel Ride</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

</MapSheetScreen>
  )
}

export default StartRide

const styles = StyleSheet.create({
  sheetContent: {
    padding: 12,
  },
})


import user from "../../../assets/images/user.png"
import { useDriverRideStore } from '@/store/driverStore'
import { useAuthStore } from '@/store/authStore'
import { RidePayload } from '@/lib/interface/ride.type'

const users = [
  {
    name: "Alice Johnson",
    image: user
  },
  {
    name: "Brian Smith",
   image: user
  },
  {
    name: "Cynthia Lee",
  image: user
  },

];
