import { ActivityIndicator, Dimensions, Image, ImageBackground, ScrollView, StyleSheet,
     Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import bg from "../../../assets/images/map_bg.png"
import className, { style } from 'twrnc'
import marker from "../../../assets/images/marker.png"
import down from "../../../assets/images/down.png"
import indicator from "../../../assets/images/indicator.png"
import cancel from "../../../assets/images/cancel.png"
import Ionicons from '@expo/vector-icons/Ionicons'
import { useLocalSearchParams, useRouter, Link } from 'expo-router'

import downArrow from "../../../assets/images/down_arrow.png"
import up from "../../../assets/images/up.png"
import dayjs from 'dayjs';



const StartRide = () => {
const router = useRouter()
const { width } = Dimensions.get('window');
const [rideDetails, setRideDetails] = useState('')


  const {id} = useLocalSearchParams()

  console.log('Mange Id details:', id)
  const {rides} = useDriverRideStore()  

 const data =  rides.find((ride: any) => ride._id === id)   
//  console.log('Start Ride details:', data) 

const {startRides,loading} = useDriverRideStore() 

const handleSubmit = async () => {
  //  router.push(`/manageRide/${id}`);
 if (typeof id !== 'string') {
    console.error('Invalid ID');
    return;
  }

  const success = await startRides(id);

  if(success) {
  setTimeout(() => {
  router.push(`/manageRide/${id}`);

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

// useEffect(() => {
//   const fetchPassengerRides = async () => {
//     setIsLoading(true);
//     try {
//       if (typeof id === 'string') {
//         const result = await getPassengerRides(id); 
//         setPassengerUser(result?.data); 
//       } else if (Array.isArray(id) && id.length > 0) {
//         await getPassengerRides(id[0]);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   fetchPassengerRides(); // ✅ call the async function
// }, []);

useEffect(() => {
    if (id && rides.length > 0) {
      const data = rides.find((ride: any) => ride._id === id);
      // console.log('Ride details:', data);
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

// console.log('Start Ride Passenger User:', passengerUser);

const [showRej, setShowRej]  = useState(false); 

const handleReject = async(id: string) => {
  await rejectPassengerRides(id)
  setShowRej(!showRej)
}


const handleAccept = async(id: string) => {
  await acceptPassengerRides(id)
  setShowRej(!showRej)
}


  return (
<ImageBackground
  source={bg}
  alt=""
  style={[className`flex-1`, { width }]}
>


        <View style={className`h-[20%] relative `}>

<TouchableOpacity style={className`absolute left-[50px] bottom-[50px]`} >
<Image source={marker}  alt='' style={className`w-[100px] h-[100px]`}   />
</TouchableOpacity>
</View>

    <View style={[className`flex-1 flex flex-col gap-3 bg-white p-3 h-[80%]`,
        {width}
    ]}>

      
<ScrollView  
showsVerticalScrollIndicator={false}
showsHorizontalScrollIndicator={false}
style={className`flex flex-col gap-3  `}>

   <TouchableOpacity style={className`w-full flex flex-row items-center justify-center`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>





<View  style={className` flex flex-col gap-4`}>


     <View style={className`flex flex-row items-start justify-between mt-2`}>


          <View style={className`flex flex-col items-center justify-start gap-2  relative`}>
   <View style={className`flex flex-row gap-2 `}>

        <Text style={className`text-2xl  font-bold ml-[-38px]`}>
          Manage ride</Text>

        <TouchableOpacity onPress={handleToggle}>
          <Image source={down} alt=''
        style={className`w-[12px] h-[7px] mt-3`}  />
</TouchableOpacity>
     
      </View>

         <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>
          Manage your trip and requests.</Text>



{showMenu && (
  <View style={className`
    absolute top-10 left-0 bg-white rounded-[8px] shadow-sm p-2 gap-3 
    items-center justify-center flex-col w-full z-10
    ${showMenu ? 'flex' : 'hidden'}
  `}>
    <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
      <Link href="/vehicle"
      style={className`border-b-1 border-gray-200`}>
      <Text>Vehicle</Text>
       </Link>
    </TouchableOpacity>

       <TouchableOpacity onPress={handleLogout}>
    
      <Text style={className`text-red-500 font-bold hover:text-red-300`}>
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

    <TouchableOpacity>
      <Image source={cancel} alt='' style={className`w-[20px] h-[20px]`   }  />
    </TouchableOpacity>

     </View>


  
  <View style={className`flex flex-col gap-4  `}>

{/* Ride details */}
        <View style={className`px-2`} >
        
        <Text style={className`text-black font-bold text-base`}>Ride Details</Text>

                <View  style={className`flex flex-col bg-white  `}>
        
            
                <View style={className`flex flex-row 
                 items-center justify-between gap-[10px] w-full  px-2`}>
        
        <View style={className`flex flex-col gap-1 py-4`}>
        
        <View style={className`flex flex-row gap-1`}>
            <Image source={up}  alt=""
            style={className``}  />
            <Text style={className`text-[14px] font-bold`}>{data?.originAddress}</Text>
        </View>
        
        <Text style={className`text-[12px] font-bold text-[#434343]`}>
          {data?.destinationAddress }
        </Text>
        </View>
        
      
        
        
                </View>

                </View>


{/* Seperator with time */}
                <View style={className`flex flex-row items-center  gap-2 px-2`}>
                  <Text style={className`text-[#8C8C8C] text-sm`}>
                    {dayjs(data?.departureTime).format('MMM D, h:mm A')}
                    </Text>
                  <View style={className`w-full border-[#ECECEC] border-[2px] w-[45%] h-[2px]`}></View>
                  <Text style={className`text-[#008000] text-sm font-bold`}>#25,000.00</Text>
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
        
        <Text style={className`text-[12px] font-bold text-[#434343]`}>
               {data?.destinationAddress }</Text>
        </View>
        
       
        
                </View>
       
        
    
             
        
                </View>
      
        </View>

        

  <View style={className`flex flex-col gap-2`}>

    {/* passengers */}

{passengerUser?.data && passengerUser.data.length > 0 ? (
  <View className='flex flex-col gap-4'>
    {passengerUser.data.map((booking: any) => (
      <View key={booking._id} style={className`flex flex-row items-center justify-between py-2`}>
      
        <View style={className`flex flex-row gap-3 items-center`}>
          <Image source={user} style={className`rounded-full w-10 h-10`} />
          <Text style={className`font-bold text-sm`}>
            {booking.passenger.firstName} {booking.passenger.lastName}
          </Text>
    
    
        </View>

{ booking.status === 'PENDING'   &&
<View
  className="flex flex-row gap-2 items-center w-full"
  style={{ display: showRej ? 'none' : 'flex' }}
>

         <TouchableOpacity onPress={() => handleReject(booking._id)  }>
         
          <View style={className`flex flex-row items-center justify-center bg-[#DC3545] w-[71px] h-[35px] rounded-[8px]`}>
            <Text style={className`text-white text-sm font-bold`}>Reject</Text>
          </View>
           </TouchableOpacity> 
           

  <TouchableOpacity onPress={() => handleAccept(booking._id)  }>


          <View style={className`flex flex-row items-center justify-center bg-[#28A745] w-[71px] h-[35px] rounded-[8px]`}>
            <Text style={className`text-white text-sm font-bold`}>Accept</Text>
          </View>

          </TouchableOpacity>
          
        </View>
    }
        
      </View>
    ))}
  </View>
) : (
  <View>
    <Text style={className`text-center text-gray-500`}>No passengers available</Text>
  </View>
)
}


  </View>

{/* button */}

<View style={className`flex flex-col gap-2`}>

      {/* Button */}
  <View 
  style={className`w-full flex items-center justify-center`}>
    <TouchableOpacity onPress={handleSubmit}
      style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]`}>
      <Text style={className`text-white text-[16px]`}>
        
      {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={className`text-white text-[16px]`}>
                          Start Ride</Text>
                        )}
        
        </Text>
    </TouchableOpacity>
  </View>

        {/* Button */}
  <View style={className`w-full flex items-center justify-center`}>
    <TouchableOpacity onPress={() => router.back()}
      style={className`w-full h-[46px] bg-[#F0F0F0] flex items-center justify-center rounded-[6px]`}>
      <Text style={className`text-[#FF0000] text-[16px]`}>Cancel Offer</Text>
    </TouchableOpacity>
  </View>


    
</View>

</View>

 

     </View>

    </ScrollView>

    </View>

    </ImageBackground>
  )
}

export default StartRide


import user from "../../../assets/images/user.png"
import { useDriverRideStore } from '@/store/driverStore'
import { useAuthStore } from '@/store/authStore'

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
