import { Image, ImageBackground, ScrollView, StyleSheet,
     Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import bg from "../../assets/images/map_bg.png"
import className, { style } from 'twrnc'
import marker from "../../assets/images/marker.png"
import down from "../../assets/images/down.png"
import { riderlist, riderListData } from '@/constants/data/riderList'
import indicator from "../../assets/images/indicator.png"
import cancel from "../../assets/images/cancel.png"
import { Link, router, useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { useDriverRideStore } from '@/store/driverStore'

import up from "../../assets/images/up.png"
import downs from "../../assets/images/down_arrow.png"
import arrow from "../../assets/images/arrow-right.png"

import dayjs from 'dayjs';


const historyTitle= [
   {title: 'Upcoming'},
  {title: 'Completed'},
   {title: 'Pending'},
    {title: 'Cancelled'},
]


const DriverIndex = () => {

  const route = useRouter()
const [title, setTitle] = useState('Upcoming')

const handleTitle = (title : string) => {
  setTitle(title)

}
const [showMenu, setShowMenu] = useState(false)

const handleToggle = () => {
  setShowMenu(!showMenu)
}

const {logout} = useAuthStore()
const {rides, getAllRides} = useDriverRideStore()

const handleLogout = async() => {
  await logout()
  setShowMenu(!showMenu)
  route.push('/(auth)')

}

useEffect(() => {
  getAllRides()
},[])

// console.log('All Rides one:', rides)


  return (
   <ImageBackground
    source={bg} alt=''
    style={className`flex-1 `}
    >

<View style={className`h-[15%] relative `}>

<TouchableOpacity style={className`absolute left-[50px] bottom-[50px]`} >
<Image source={marker}  alt='' style={className`w-[100px] h-[100px]`}   />
</TouchableOpacity>
</View>

<View
style={className`h-[85%] bg-[#FAFAFA] flex-col flex rounded-t-[30px]  gap-7 p-1`}  >




    <View style={className`flex flex-col gap-4 w-full bg-white h-full p-3`} >

       <TouchableOpacity style={className`w-full flex flex-row items-center justify-center`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>




     <View style={className`flex flex-row items-center justify-between`}>

    <View style={className`flex flex-row items-center gap-2  relative`}>
        <Text style={className`text-black text-2xl font-bold`}>Trip History</Text>

<TouchableOpacity onPress={handleToggle}>
          <Image source={down} alt=''
        style={className`w-[12px] h-[7px]`}  />
</TouchableOpacity>

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

    
<TouchableOpacity onPress={() => route.back()}>

      <Image source={cancel} alt='' style={className`w-[20px] h-[20px]`   }  />
    </TouchableOpacity>

    </View>
    

    
   <View style={className`flex flex-row gap-3 mt-3`}>
  {historyTitle.map((his, index) => (
    <TouchableOpacity
      key={index}
      onPress={() => handleTitle(his.title)}
      style={[
        className`rounded-[8px] h-[30px] flex flex-row items-center justify-center px-2 mt-3`,
        title === his.title ? className`bg-black` : className`bg-[#AAAAAA]`,
      ]}
    >
      <Text style={className`text-white text-sm`}>{his.title}</Text>
    </TouchableOpacity>
  ))}
</View>



<ScrollView
showsVerticalScrollIndicator={false}
style={className`flex flex-col gap-3 min-h-[200px] `}
>
  <View style={className` mt-3`} >
        
{/* displaying rides */}

      {rides && rides.length > 0 ?
      
   <View style={className`flex flex-col gap-4 `}>

    {/* displaying rides */}
{rides.map((rider: any) => (
  <TouchableOpacity key={rider._id}
onPress={() => router.push(`/${rider._id}/startRide`)} >
  <View  style={className`border-[1px] border-[#EBEBEB] rounded-[8px]`}>
    <View style={className`flex flex-col bg-white`}>
      <View style={className`flex flex-col items-start justify-between w-full px-3`}>
        
        <View style={className`flex flex-col gap-1 py-4`}>

          {/* current destination */}

          <View style={className`flex flex-col gap-1 pt-1`}>
           <View style={className`flex flex-row gap-1`}>
             <Image source={up} alt="" style={className``} />
             <Text style={className`text-[14px] font-bold`}> 
               {rider.originAddress} </Text>
           </View>

           {/* <Text style={className`text-[12px] font-bold text-[#434343]`}>
            {rider.originAddress}
            </Text> */}

          </View>
          

  
        </View>

{/* divider */}
        <View style={className`flex flex-row items-center gap-3`}>
          <View style={className`rounded-lg flex flex-row items-center justify-center max-w-[133px]
             h-[32px] w-full bg-[#F0F0F0] gap-1 rounded-[8px]`}>
            <Text style={className`text-[12px] font-bold text-[#8C8C8C]`}>
            {dayjs(rider.departureTime).format('MMM D, YYYY h:mm A')}
            </Text>
          </View>

          <View style={className`flex-1 h-[2px] bg-[#ECECEC]`} />

          <Text style={className`text-[#008000] text-sm font-semibold`}>
            NGN {rider.pricePerSeat}
          </Text>
        </View>

        {/* arrival destination */}

            <View style={className`flex flex-col gap-1 py-4`}>
           <View style={className`flex flex-row gap-1`}>
             <Image source={downs} alt="" style={className``} />
             <Text style={className`text-[14px] font-bold`}>  
              {rider.destinationAddress}
               </Text>
           </View>

           {/* <Text style={className`text-[12px] font-bold text-[#434343]`}>
            {rider.originAddress}
            </Text> */}

          </View>

      </View>
      
    </View>

  </View>
  </TouchableOpacity>
))}

</View>

:

  <View style={className`flex-1 items-center justify-center`}>
       <Text style={className`text-[#AAAAAA] text-2xl font-bold`}>No vehicle please add a vehicle</Text>
    </View>

}
        
        </View>
          </ScrollView>

          {Array.isArray(riderListData) && riderListData.length === 0 && (
  <View style={className`flex-1 items-center justify-center min-h-[300px]`}>
       <Text style={className`text-[#AAAAAA] text-2xl font-bold`}>No vehicle please add a vehicle</Text>
    </View>
)}



{/* offer/schedule  button*/}
          <View style={className`flex flex-col gap-3`}>

            <TouchableOpacity
          onPress={() => route.push('/create')}
            style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]  `}>
                <Text style={className`text-white text-[16px]`}>Offer a Ride</Text>
            </TouchableOpacity>

               <TouchableOpacity
                onPress={() => route.push('/(schedule)')}
            style={className`w-full h-[46px] border-[1px] border-[#245AB0] flex items-center justify-center
             rounded-[6px]  bg-white  `}>
                <Text style={className`text-[#245AB0] text-[16px]`}>Schedule a Ride</Text>
            </TouchableOpacity>
            
            

          </View>
    
    </View>

  
    </View>

    </ImageBackground>
  )
}

export default DriverIndex

const styles = StyleSheet.create({})


//   {rides.map((rider) =>
//   <View key={rider._id} style={className`border-[1px] border-[#EBEBEB] rounded-[8px]`}>
//   {
//     rider.map((location: riderlist) => (
//       <View key={`${rider.id}-${location.id}`}
//        style={className`flex flex-col bg-white  `}>
//         <View
//           style={className`flex flex-col items-start justify-between  w-full px-3 `}
//         >
//           <View style={className`flex flex-col gap-1 py-4`}>
//             <View style={className`flex flex-row gap-1`}>
//               <Image source={location.image} alt="" style={className``} />
//               <Text style={className`text-[14px] font-bold`}>{location.first_location}</Text>
//             </View>

//             <Text style={className`text-[12px] font-bold text-[#434343]`}>
//               {location.first_direction}
//             </Text>
//           </View>

// { location.date  &&
// <View style={className`flex flex-row items-center gap-3`}>


//  <View
//     style={className` rounded-lg flex flex-row items-center
//   justify-center max-w-[113px] h-[32px] w-full bg-[#F0F0F0]  gap-1 rounded-[8px]`}
//         >
//    <Text style={className`text-[12px] font-bold text-[#8C8C8C]`}>{location.date}</Text>
//       </View>

//     <View style={className`flex-1 h-[2px] bg-[#ECECEC]`} />

//       <Text style={className`text-[#008000] text-sm font-semibold  `}> NGN{location.price} </Text>

//       </View>

//     }

//         </View>

//         {/* <View
//           style={className`bg-black rounded-lg flex flex-row items-center justify-center max-w-[113px] h-[32px] w-full mx-3 gap-1`}
//         >
//           <Text style={className`text-[12px] font-bold text-white`}>{location.time}</Text>
//         </View> */}
//       </View>
//     ))

//   }
//   </View>
//   )}