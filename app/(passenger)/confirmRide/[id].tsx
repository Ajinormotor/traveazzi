import { Image, ImageBackground, ScrollView, StyleSheet,
     Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import className, { style } from 'twrnc'
import bg from "../../../assets/images/map_bg.png"
import marker from "../../../assets/images/marker.png"
import indicator from "../../../assets/images/indicator.png"
import { useLocalSearchParams, useRouter, useSearchParams } from 'expo-router/build/hooks'
import { riderListData } from '@/constants/data/riderList'
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

const ConfirmRide = () => {

const { id } = useLocalSearchParams();
const route = useRouter();

const { rides, singleRides } = useDriverRideStore();
const { requestBookings } = usePassengerStore(); // ✅ Move this hook to the top-level

const [rideDetails, setRideDetails] = useState<any>(null);
const [isLoading, setIsLoading] = useState(false)

useEffect(() => {
  const fetchingSingleRide = async () => {
    const rideId = Array.isArray(id) ? id[0] : id ?? '';
    const result = await singleRides(rideId);
    setRideDetails(result);
  };

  fetchingSingleRide();
}, [id, singleRides]);

if (!rideDetails) return <Text>Loading ride...</Text>;

const item = rideDetails;

const handleTransit = (item: any) => {
  if (item?._id) {
    route.push(`/transitRide/${item._id}`); // ✅ use _id not id
  } else {
    console.error('Invalid item or missing id');
  }
};



const handleConfirm = async () => {
    setIsLoading(true)

  const payload = {
    rideId: item._id,
    seatsNeeded: item?.initialSeats ?? 1, 
    pickupAddress: item?.destinationAddress,
    dropoffAddress: item?.originAddress,
  };

  await requestBookings(payload as any);
  setIsLoading(false)
  route.push({
    pathname: '/payRide/[id]',
    params: { id: item._id}
  })
};


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
style={className`h-[85%] bg-[#FAFAFA] flex-col flex rounded-t-[30px]  gap-7`}  >



<ScrollView
showsVerticalScrollIndicator={false}
style={className`flex flex-col gap-3`}
>
    <View style={className`flex flex-col w-full bg-white`}
>

<TouchableOpacity style={className`w-full flex flex-row items-center justify-center mt-4`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>



  <View style={className`flex flex-row w-full items-center justify-between bg-white`}>

    <View style={className`flex flex-row items-center justify-between gap-[10px] w-full p-3`}>
      <View style={className`flex flex-col gap-1 py-4`}>
        <Text style={className`text-[20px] font-bold`}>
            {item?.destinationAddress ?? ''}
            </Text>
        <Text style={className`text-[12px] font-bold text-[#AAAAAA]`}>
      {item?.destinationAddress ?? ''}
            </Text>
      </View>
    </View>

    <TouchableOpacity onPress={() => route.back()}>
      <Image source={cancel} alt='' style={className`w-[20px] h-[20px]`} />
    </TouchableOpacity>

  </View>


<View style={className`flex flex-row items-center justify-start px-3 gap-2`}>

    <TouchableOpacity
    style={className`w-[175px] h-[36px] rounded-lg bg-[#28A745]
         flex flex-row  items-center justify-center gap-2`}>
        <Image source={white_receipt}  alt=''
        style={className`flex flex-row items-center justify-center` } />
        <Text style={className`text-white`}>Share Ride details</Text>
    </TouchableOpacity>

    <TouchableOpacity  onPress={() => route.back()}
    style={className`w-[175px] h-[36px] flex flex-row  items-center justify-center
         gap-2 rounded-lg bg-[#DC3545]`}>
        <Image source={white_cancel}  alt=''
        style={className`flex flex-row items-center justify-center` } />
        <Text style={className`text-white`}>Cancel Ride</Text>
    </TouchableOpacity>

</View>



</View>

<View style={className`bg-white p-3 mt-3`}>

       
                <View  style={className`flex flex-col gap-2`}>

<View style={className`flex flex-col gap-[10px] bg-white`} > 

                    <View style={className`flex flex-row items-center justify-between`}>

                        <View style={className`w-[101px] h-[31px] bg-[#F7F7F7] rounded-[5px] p-1 flex 
                            flex-row items-center justify-center`}>
                            <Text>{item.vehicle?.plateNumber ?? ''}</Text>
                        </View>
                        <View>
                 <Text style={className`text-2xl text-[#008000]`}>NGN {item?.pricePerSeat ?? ''}</Text>
                        </View>

                    </View>

              

                   <View style={className`flex flex-row items-center justify-between`}>

<View style={className`flex flex-row gap-1`}>
    <View>
    <Image source={userOne} alt=''
    className='w-[50px] h-[50px] rounded-full'  />
    </View>
    <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-sm font-bold text-black`}> {item?.firstName ?? 'Martins Ken'} </Text>
        <Text style={className`font-bold text-[12px]  text-[#A1A1A1]`}> 
            {item?.vehicle.make ?? 'Blue'},
             {item?.vehicle.color ?? 'Blue'} 

            
            </Text>
    </View>

</View>

<View style={className`flex flex-row gap-2`}>
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
</View>



<View style={className`w-full flex flex-row items-center justify-center bg-white`}>

</View>

                </View>

                <View style={className`flex flex-row items-center gap-3 px-6 w-full bg-[#FAFAFA] rounded-lg py-[10px]`}>
                    <Image source={danger} alt=''
 style={className``}   />

 <Text style={className`max-w-[300px] w-full`}>
    <Text style={className`text-[#AAAAAA] text-[12px]`}>Your driver is currently
        <Text style={className`text-[#28A745]`}> 3.2  </Text>mile away from your 
        closest landmark:   <Text style={className`text-[#007BFF]`}>Rainoil Fuel Station. </Text> You can call the driver to discuss
         a suitable meetup point.</Text>

 </Text>
                </View>
      
      </View>

      <View style={className` mt-3`} >
        
{/*         
        {
            item.location_details.map((location) => ( */}
                <View 
                // key={location.id }
                 style={className`flex flex-col bg-white py-2 `}>
        
            
                <View style={className`flex flex-row 
                 items-center justify-between gap-[10px] w-full  p-3`}>
        
        <View style={className`flex flex-col gap-1 py-4`}>
        
        <View>
            
        </View>
        <View style={className`flex flex-row gap-1`}>
           <Image source={up}  alt=""
    style={className``}  />
    <Text style={className`text-[14px] font-bold`}>
  {item?.destinationAddress}
      </Text>
        </View>
       
<View style={className`flex flex-row gap-1`}>
    <Image source={downs}  alt=""
    style={className``}  />
    <Text style={className`text-[14px] font-bold`}>
  {item?.originAddress}
      </Text>
</View>
        </View>
        
        <View style={className`w-[71px] h-[22px] rounded-lg flex items-center justify-center 
            bg-[#F0F0F0]`}>
            <Text style={className`font-bold text-[12px] text-[#AAAAAA]`}>
               {dayjs(item?.departureTime).format('h:mm A')}
                </Text>
        </View>
        
        
                </View>
       
            {/* <View style={className`bg-black rounded-lg flex flex-row items-center justify-center
             max-w-[113px] h-[32px] w-full mx-3 gap-1`}>
            <Text style={className`text-[12px] font-bold text-white`}>
               {dayjs(item?.departureTime).format('h:mm A')}
          
                </Text>
            </View> */}
    
             
        
                </View>
            {/* ))
        } */}
        
        </View>


{/* trip preference */}
<View style={className`w-full flex flex-col  bg-white p-3 gap-4 mt-4`}>

    <View>
        <Text style={className`text-[16px]  font-bold`}>Trip preference</Text>
    </View>

    <View style={className`flex flex-row gap-1 `}>
        <TouchableOpacity  onPress={() => handleConfirm()}
         style={className`bg-[#245AB0] w-[271px] h-[44px] flex items-center justify-center rounded-lg`}>
            <Text style={className`text-white`}>Confirm Ride</Text>
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

</View>

        </ImageBackground>

  )
}

export default ConfirmRide

const styles = StyleSheet.create({})