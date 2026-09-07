import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import className, { style } from 'twrnc'
import MapEmbed from '@/components/MapEmbed';
import bg from "../../assets/images/map_bg.png"
import marker from "../../assets/images/marker.png"
import directions from "../../assets/images/navigation-03.png"
import indicator from "../../assets/images/indicator.png"
import cancel from "../../assets/images/cancel.png"
import load from "../../assets/images/available drivers.png"
import options from "../../assets/images/options.png"
import { riderListData } from '@/constants/data/riderList'
import routes_arrow from "../../assets/images/routes_arrow.png"
import { useRouter } from 'expo-router'

const ScheduleResult = () => {
const [loading,setLoading] = useState<boolean >(true)
const route = useRouter()

useEffect(() => {
    
    const hideTimeout = setTimeout(() => {
      setLoading(false);
    }, 1000); 
  
    return () => {
      clearTimeout(hideTimeout);
    };
  }, []);
  

const [ scheduled, setScheduled] = useState(false)

 

  return (

      <View style={className`flex-1 `}>
      <MapEmbed mode="view" fallback={bg} />

<View style={className`h-[30%] relative `}>

<TouchableOpacity style={className`absolute left-[50px] bottom-[50px]`} >
<Image source={marker}  alt='' style={className`w-[100px] h-[100px]`}   />
</TouchableOpacity>

<TouchableOpacity style={className`absolute right-[30px] bottom-[20px]`}>

    <View style={className` w-[40px] h-[40px]  rounded-full bg-white flex flex-row items-center
         justify-center border-[1px] border-[#F0F0F0]`}>
    <Image source={directions}  alt='' style={className`w-[20px] h-[20px]`}   />
    </View>

</TouchableOpacity>

</View>


{

    loading  ?

    (
<View
    style={className`h-[70%] bg-white flex-col  rounded-t-[30px] py-4 px-3 gap-7`}  >

<TouchableOpacity style={className`w-full flex flex-row items-center justify-center`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>

      <View style={className`flex flex-row items-center justify-between`}>
        <Text style={className`font-medium text-[16px]`}>Searching for available ride...</Text>

        
            <TouchableOpacity>
              <Image source={cancel} alt='' style={className`w-[20px] h-[20px]`   }  />
            </TouchableOpacity>

      </View>

      <View style={className`flex-1`}>
      <Image  source={load} alt=''
      className='flex-1 h-full w-full' />

      </View>
    </View>

  )

:

(
<View 
style={className`h-[70%] bg-white flex-col  rounded-t-[30px] py-4 px-3 gap-7`}  >

    
<TouchableOpacity style={className`w-full flex flex-row items-center justify-center`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>


<ScrollView
showsVerticalScrollIndicator={false}

>



      <View style={className`flex flex-row items-center justify-between`}>
        <Text style={className`font-medium text-[16px]`}>Available ride...</Text>

        
            <TouchableOpacity>
              <Image source={cancel} alt='' style={className`w-[20px] h-[20px]`   }  />
            </TouchableOpacity>

      </View>

      <View style={className`flex flex-col gap-3`}>
        {
            riderListData.map((r) => (
                <View key={r.id}  style={className`flex flex-col gap-2`}>

<View style={className`flex flex-col gap-[10px] bg-white`} > 

                    <View style={className`flex flex-row items-center justify-between`}>

                        <View style={className`w-[101px] h-[31px] bg-[#F7F7F7] rounded-[5px] p-1 flex 
                            flex-row items-center justify-center`}>
                            <Text>{r.plate_no}</Text>
                        </View>
                        <View>
                 <Text style={className`text-2xl text-[#008000]`}>₦{r.price}</Text>
                        </View>

                    </View>

                    <View style={className`border-[1px] border-[#F6F5F5] w-full`}>
                        
                    </View>

                   <View style={className`flex flex-row items-center justify-between`}>

<View style={className`flex flex-row gap-1`}>
    <View>
    <Image source={r.image} alt=''
    className='w-[50px] h-[50px] rounded-full'  />
    </View>
    <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-sm font-bold text-black`}> {r.rider_name} </Text>
        <Text style={className`font-bold text-[12px]  text-[#A1A1A1]`}> {r.vehicle} </Text>
    </View>

</View>

<TouchableOpacity>
    <Image source={options} alt=''
    className='w-[20px] h-[20px] rounded-full'  />
</TouchableOpacity>

                    </View>
</View>

<View >


{
    r.location_details.map((location) => (
        <View key={location.id } style={className`flex flex-col bg-[#FAFAFA]`}>

    
        <View style={className`flex flex-row 
         items-center justify-between gap-[10px] w-full  p-3`}>

<View style={className`flex flex-col gap-1 py-4`}>

<View style={className`flex flex-row gap-1`}>
    <Image source={location.image}  alt=""
    style={className``}  />
    <Text style={className`text-[14px] font-bold`}>{location.first_location}</Text>
</View>

<Text style={className`text-[12px] font-bold text-[#434343]`}>{location.first_direction}</Text>
</View>

<View>
    <Text style={className`font-bold text-[18px]`}>{location.time}</Text>
</View>


        </View>

{
    location.view &&    
    <View style={className`bg-black rounded-lg flex flex-row items-center justify-center
     max-w-[113px] h-[32px] w-full mx-3 gap-1`}>
    <Text style={className`text-[12px] font-bold text-white`}>{location.view}</Text>
    <Image source={routes_arrow}  alt=""
    style={className`w-[20px] h-[20px]`}  />
    </View>
}
     

        </View>
    ))
}

</View>

<View style={className`w-full flex flex-row items-center justify-center bg-white`}>

{ scheduled ?

<TouchableOpacity
onPress={() => setScheduled(true)}
style={className`w-[361px] h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]  `}>
    <Text style={className`text-white text-[16px]`}>Request To Join</Text>
</TouchableOpacity>

:

<TouchableOpacity
 onPress={() => route.push({pathname: "/(passenger)/confirmRide/[id]", params: {id: r.id}})}
style={className`w-[361px] h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]  `}>
    <Text style={className`text-white text-[16px]`}>Request To Join</Text>
</TouchableOpacity>

        }

</View>

                </View>
            ))
        }
      </View>

      </ScrollView>



</View>

)

}

        </View>

  )
}

export default ScheduleResult

const styles = StyleSheet.create({})