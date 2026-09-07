import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput,
     TouchableOpacity, View } from  'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import className, { style } from 'twrnc'
import MapEmbed from '@/components/MapEmbed';

import transit_bg from "../../../assets/images/bg_map_ongoing.png"
import indicator from "../../../assets/images/indicator.png"
import distanceIcon from "../../../assets/images/Flash-Fast-Speed--Streamline-Core.png.png"
import i from "../../assets/images/i.png"
import green_gps from "../../../assets/images/green_gps.png"
import transit_car from "../../../assets/images/car_9855634 1.png"
import down from "../../../assets/images/down.png"
import { LinearGradient } from 'expo-linear-gradient'
import { usePassengerStore } from '@/store/passengerStore'
import { useDriverRideStore } from '@/store/driverStore'

import userOne from "../../../assets/images/user_logo img (1).png"
import dayjs from 'dayjs'

import up from "../../../assets/images/up.png"
import downs from "../../../assets/images/down_arrow.png"

const emoji = [
  { icon: '😁', label: 'Great' },
  { icon: '😃', label: 'Good' },
  { icon: '😐', label: 'Okay' },
  { icon: '😖', label: 'Terrible' },
  { icon: '😞', label: 'Poor' },
];


const PayRide = () => {

const { id } = useLocalSearchParams();
const route = useRouter();

const { rides, singleRides } = useDriverRideStore();
const { payBookings } = usePassengerStore();

const [rideDetails, setRideDetails] = useState<any>(null);
const [isLoading, setIsLoading] = useState(false);
const [isPaying, setIsPaying] = useState(false);
const [showReport, setShowReport] = useState(false);


useEffect(() => {
  const fetchingSingleRide = async () => {
    const rideId = Array.isArray(id) ? id[0] : id ?? '';
    const result = await singleRides(rideId);
    setRideDetails(result);
  };

  fetchingSingleRide();
}, [id, singleRides]);

// console.log('Pay Ride Details', rideDetails)



 
useEffect(() => {
  const timer = setTimeout(() => {
    setShowReport(true);
  }, 500);

  return () => clearTimeout(timer);
}, []);


  const handleShowReport = () => {
    setShowReport(false);
  };


if (!rideDetails) return <View style={[className`flex-1 items-center justify-center`]}><ActivityIndicator size={40}  color="#000"  /></View>; 

const item = rideDetails;

const handlePay = async () => {
  if (isPaying) return;
  setIsPaying(true);
  try {
    await payBookings(item._id);
    route.push('/(passenger)/home')
  } finally {
    setIsPaying(false);
  }
};

  return (
    <View style={className`flex-1 `}>
    <MapEmbed mode="directions" origin={item?.originAddress} destination={item?.destinationAddress} fallback={transit_bg} />


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

 {item?.status === 'COMPLETED' ?  
 
 <View style={className`flex flex-row gap-[10px]`}>
        <Image source={distanceIcon} alt=''
        style={className`w-[24px] h-[24px]`  }  />
        <Text style={className`flex flex-row gap-1 text-[18px]`}>
            <Text style={className`font-bold text-[#000000]`} >

                Journey Ended
                
                {/* You've Arrived! */}
                
                </Text>
            
        </Text>
    </View>

    :
     
 <View style={className`flex flex-row gap-[10px]`}>
        <Image source={distanceIcon} alt=''
        style={className`w-[24px] h-[24px]`  }  />
        <Text style={className`flex flex-row gap-1 text-[18px]`}>
            <Text style={className`font-bold text-[#000000]`} >

                Journey Underway
                
                {/* You've Arrived! */}
                
                </Text>
            
        </Text>
    </View>
}
{/* Date and time */}


    </View>


{/* Linear gradient */}
  {item?.status === 'COMPLETED' ?  <View style={className`flex flex-row items-center gap-[10px] h-[32px] w-full px-2 bg-[#FAFAFA] rounded-[4px]`}>

        <View style={className`flex flex-row gap-[10px] w-[95%] items-center `}>
            <LinearGradient
            colors={['#D3D3D3', '#000000']}
            style={className` h-[6px] w-[95%]`}
            >
            </LinearGradient>

        <Image source={transit_car} alt=''
            style={className`w-[24px] h-[16px]`} />
               <View style={className`bg-[#00B964] h-[6px]  w-[0%] rounded-[1px]`}></View>

 </View>

        <View style={className`w-[5%]`}>
            <Image source={green_gps} alt=''
            style={className`w-[16px] h-[16px]`} />
        </View>

       
    </View>


:

 <View style={className`flex flex-row items-center gap-[10px] h-[32px] w-full px-2 bg-[#FAFAFA] rounded-[4px]`}>

        <View style={className`flex flex-row gap-[10px] w-[95%] items-center `}>
            <LinearGradient
            colors={['#D3D3D3', '#000000']}
            style={className` h-[6px] w-[30%]`}
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


}

{/* Trip Summary */}
<View>
    <Text style={className`text-black text-[15px]`}>Trip Summary</Text>
</View>


</View>

</View>

{/* Lower  */}
   <View  style={className`flex flex-col gap-2  py-3 bg-white px-2 `}>

<View style={className`flex flex-col gap-[10px] bg-white`} > 

   <View style={className`flex flex-row items-center justify-between`}>

      <View style={className`w-[101px] h-[31px] bg-[#F7F7F7] rounded-[5px] p-1 flex  font-bold
                            flex-row items-center justify-center`}>
                            <Text>{item?.vehicle?.plateNumber ?? '12345'}</Text>



                            
      </View>

  
  </View>

                    <View style={className`border-[1px] border-[#F6F5F5] w-full`}>
                        
                    </View>

                   <View style={className`flex flex-col `}>

<View style={className`flex flex-row gap-1`}>


{/* driver details */}
  <View style={className`flex-1 flex-row gap-1`}>

    <View>

    <Image source={userOne} alt=''
    className='w-[50px] h-[50px] rounded-full'  />
    </View>

    <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-sm font-bold text-black`}> {item?.driver?.firstName ?? ''} {item?.driver?.lastName ?? ''} </Text>
        <Text style={className`font-bold text-[12px]  text-[#A1A1A1]`}> 
            {item?.vehicle.make ?? 'Blue'},
             {item?.vehicle.color ?? 'Blue'} 

            
            </Text>
    </View>

</View>

{/* price */}
  <View>
                 <Text style={className`text-2xl text-[#008000] font-bold`}>
                    ₦{item?.pricePerSeat}</Text>
                        </View>

</View>





                    </View>

                    <View style={className`border-[1px] border-[#F6F5F5] w-full`}>
                        
                              <View 
                // key={location.id }
                 style={className`flex flex-col bg-white py-2 `}>
        
            
                <View style={className`flex flex-row 
                 items-center justify-between gap-[10px] w-full  p-3`}>
        
        <View style={className`flex flex-col gap-1 py-4`}>
        
  

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
                        </View>
</View>


<View style={className`w-full flex flex-col  bg-white  gap-4 mt-4`}>

    {/* <View>
        <Text style={className`text-[16px]  font-bold`}>Trip preference</Text>
    </View> */}


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

  { item?.status === 'COMPLETED' &&    <View style={className`flex flex-row gap-1 `}>
        <TouchableOpacity  onPress={handlePay} disabled={isPaying}
          style={className`bg-[#245AB0] w-[271px] h-[44px] flex items-center justify-center rounded-lg ${isPaying ? 'opacity-60' : ''}`}>
            {isPaying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={className`text-white`}>Pay Now</Text>
            )}
        </TouchableOpacity>

        <View style={className`flex flex-row items-center justify-center border-[1px] border-[#E4EFFF]
            w-[85px] h-[44px] gap-1 rounded-r-lg`}>
        <Text style={className`text-black text-[14px]`}>Cash</Text>
        <Image source={down} alt=''
        style={className`w-[12px] h-[7px]`}  />
            
        </View>

    </View>
}
   

</View>

                </View>

</ScrollView>
    </View>

        </View>
  )
}

export default PayRide

const styles = StyleSheet.create({})