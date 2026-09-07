import { Image, ScrollView, StyleSheet, Text, 
     TouchableOpacity, View } from  'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import className, { style } from 'twrnc'
import MapEmbed from '@/components/MapEmbed';
import transit_bg from "../../../assets/images/bg_map_ongoing.png"
import indicator from "../../../assets/images/indicator.png"
import distanceIcon from "../../../assets/images/Flash-Fast-Speed--Streamline-Core.png.png"
import i from "../../../assets/images/i.png"
import green_gps from "../../../assets/images/green_gps.png"
import transit_car from "../../../assets/images/car_9855634 1.png"
import { LinearGradient} from "expo-linear-gradient"
import down from "../../../assets/images/down.png"
import { useDriverRideStore } from '@/store/driverStore';

const ManageRides = () => {


  const {id} = useLocalSearchParams()


  const {rides} = useDriverRideStore()  
 const data =  rides.find((ride: any) => ride._id === id) 
//  console.log('Manage Ride data:', data)

const router = useRouter()

const handleSubmit = () => {
    router.push('/(driver)/destination')
}

const {getPassengerRides, completeBookingRide} = useDriverRideStore()



const [passengerUser, setPassengerUser] = useState<any>(null);
const[isLoading, setIsLoading] = useState(true);  
const [rideDetails, setRideDetails] = useState<RidePayload | null>(null)
const [showMenu, setShowMenu] = useState<string | null>(null);



const handleShowMenu = (id:string) => {
  if (typeof id !== 'string') {
    console.error('Invalid ID');
    return;
  }

  setShowMenu(prevId => (prevId === id ? null : id));
}

const handleCancel = (id: string) => {
  setShowMenu(null)
}

const handleComplete = (id: string) => {
  completeBookingRide(id)
    setShowMenu(null)
}




useEffect(() => {
    if (id && rides.length > 0) {
      const data = rides.find((ride: any) => ride._id === id);
      // console.log('Manage Ride details:', data);
      setRideDetails(data || null); 
    }


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
    <View style={className`flex-1 `}>
    <MapEmbed mode="directions" origin={data?.originAddress} destination={data?.destinationAddress} fallback={transit_bg} />


<View style={className`h-[30%] relative `}>


</View>

<View 
style={className`h-[70%] bg-[#FAFAFA]  flex-col  rounded-t-[30px]  gap-2`}  >

    <ScrollView
showsVerticalScrollIndicator={false}
style={className`flex flex-col gap-3`}
>

{/* upper */}
    <View style={className`bg-white px-2 flex flex-col gap-[10px]`}>

  
<TouchableOpacity style={className`w-full flex flex-row items-center pt-2 justify-center`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>


<View style={className`flex flex-col gap-[10px] b py-3 `}>

<View style={className`flex flex-col gap-[10px]`}>

    <View style={className`flex flex-row gap-[10px]`}>
        <Image source={distanceIcon} alt=''
        style={className`w-[24px] h-[24px]`  }  />
        <Text style={className`flex flex-row gap-1 text-[18px]`}>
            <Text style={className`font-bold text-[#000000]`} >59.25</Text>
            <Text style={className`font-medium text-[#AAAAAA] ml-1`}>km/hr</Text>
        </Text>
    </View>

<View style={className`flex flex-row items-center gap-1 `}>

<Text style={className`font-bold text-[#AAAAAA] text-[14px]`}>You should be arriving by</Text>

<View style={className`bg-[#F8FFFC] w-[103px] h-[30px] flex items-center justify-center text-center
  `}>
  <Text style={className`text-[#00B964] text-[16px] font-bold`}>   06.19pm
  </Text>
</View>

</View>
  

    </View>


{/* Linear gradient */}
    <View style={className`flex flex-row items-center gap-[10px] h-[32px] w-full px-2 bg-[#FAFAFA] rounded-[4px]`}>

        <View style={className`flex flex-row gap-[10px] w-[95%] items-center `}>
            <LinearGradient
            colors={['#D3D3D3', '#000000']}
            style={className` h-[6px] w-[70%]`}
            >
            </LinearGradient>

        <Image source={transit_car} alt=''
            style={className`w-[24px] h-[16px]`} />
               <View style={className`bg-[#00B964] h-[6px]  w-[55%] rounded-[1px]`}></View>

 </View>

        <View style={className`w-[5%]`}>
            <Image source={green_gps} alt=''
            style={className`w-[16px] h-[16px]`} />
        </View>

       
    </View>

    <View style={className`flex flex-row items-center gap-3 px-2 w-full h-[52px] bg-[#FAFAFA] rounded-[6px] py-[10px]`}>
                    <Image source={i} alt=''
 style={className``}   />

 <Text style={className`max-w-[300px] w-full`}>
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

{/* Ride details */}

   <Text style={className`text-black font-bold text-base`}>Ride Details</Text>
     
        

  <View style={className`flex flex-col gap-2`}>

    <View className='flex flex-col gap-4'>


  {passengerUser?.data && passengerUser.data.length > 0 ? (
  passengerUser.data.map((booking: any, index: number) => (
    <View
      key={index}
      style={className`flex flex-row items-center justify-between py-2`}
    >
      {/* Passenger Info */}
      <View style={className`flex flex-row gap-3 items-center`}>
        <Image source={user} style={className`rounded-full w-10 h-10`} />
        <Text style={className`font-bold text-sm`}>
          {booking.passenger.firstName} {booking.passenger.lastName}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={className`flex flex-row gap-2 items-center relative`}>
        {/* Active Ride Button */}
        <View
          style={className`flex flex-row items-center justify-center bg-[#28A745] w-[108px] h-[40px] rounded-[8px]`}
        >
          <Text style={className`text-white text-sm font-bold`}>
                   {booking?.paymentStatus === 'COMPLETED' ? 'Completed' : 'Active Ride'}
          </Text>
        </View>

        {/* Dropdown Trigger */}
        <TouchableOpacity onPress={() => handleShowMenu(booking._id)}>
          <View
            style={[className`flex flex-row gap-1 items-center justify-center w-10 h-10 border-[1px] border-[#EAEAEA]`,
       {backgroundColor: passengerUser?.status === 'COMPLETED' ? 'bg-red-500' : 'bg-green-500'}
            ]}
          >
            <Image source={down} style={className`w-[10px] h-[6px]`} />
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
            <TouchableOpacity onPress={() => handleComplete(booking._id) }>
              <View style={className`border-b border-gray-200`}>
                <Text>

                  Complete Ride</Text>
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
    <TouchableOpacity onPress={handleSubmit}
      style={className`w-full h-[46px] bg-[#DC3545] flex items-center justify-center rounded-[6px]`}>
      <Text style={className`text-white text-[16px]`}>End All Ride</Text>
    </TouchableOpacity>
  </View>



    
</View>

</View>


</ScrollView>
    </View>

        </View>
  )
}

export default ManageRides

const styles = StyleSheet.create({})


import user from "../../../assets/images/user.png"
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
