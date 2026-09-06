import { Image, ScrollView, StyleSheet,
     Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import bg from "../../assets/images/map_bg.png"
import className, { style } from 'twrnc'
import MapEmbed from '@/components/MapEmbed';
import marker from "../../assets/images/marker.png"
import down from "../../assets/images/down.png"
import { riderlist, riderListData } from '@/constants/data/riderList'
import indicator from "../../assets/images/indicator.png"
import cancel from "../../assets/images/cancel.png"
import { useRouter } from 'expo-router'

const historyTitle= [
  {title: 'Completed'},
   {title: 'Upcoming'},
   {title: 'Pending'},
    {title: 'Cancelled'},
]


const TripHistory = () => {

  const route = useRouter()
const [title, setTitle] = useState('Completed')

const handleTitle = (title : string) => {
  setTitle(title)

}

  return (
   <View style={className`flex-1 `}>
   <MapEmbed mode="view" fallback={bg} />

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
    <View style={className`flex flex-row items-center gap-2 `}>
        <Text style={className`text-black text-2xl font-bold`}>Trip History</Text>

          <Image source={down} alt=''
        style={className`w-[12px] h-[7px]`}  />
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
style={className`flex flex-col gap-3 `}
>
  <View style={className` mt-3`} >
        
        
   <View style={className`flex flex-col gap-4 `}>
  {riderListData.map((rider, index) =>
  <View key={index} style={className`border-[1px] border-[#EBEBEB] rounded-[8px]`}>
  {
    rider.location_details.map((location: riderlist) => (
      <View key={`${rider.id}-${location.id}`}
       style={className`flex flex-col bg-white  `}>
        <View
          style={className`flex flex-col items-start justify-between  w-full px-3 `}
        >
          <View style={className`flex flex-col gap-1 py-4`}>
            <View style={className`flex flex-row gap-1`}>
              <Image source={location.image} alt="" style={className``} />
              <Text style={className`text-[14px] font-bold`}>{location.first_location}</Text>
            </View>

            <Text style={className`text-[12px] font-bold text-[#434343]`}>
              {location.first_direction}
            </Text>
          </View>

{ location.date  &&
<View style={className`flex flex-row items-center gap-3`}>


 <View
    style={className` rounded-lg flex flex-row items-center
  justify-center max-w-[113px] h-[32px] w-full bg-[#F0F0F0]  gap-1 rounded-[8px]`}
        >
   <Text style={className`text-[12px] font-bold text-[#8C8C8C]`}>{location.date}</Text>
      </View>

      <View style={className`max-w-[40%] w-full bg-[#ECECEC] h-[2px]`}></View>

      <Text style={className`text-[#008000] text-sm font-semibold `}> ₦{location.price} </Text>

      </View>

    }

        </View>

        {/* <View
          style={className`bg-black rounded-lg flex flex-row items-center justify-center max-w-[113px] h-[32px] w-full mx-3 gap-1`}
        >
          <Text style={className`text-[12px] font-bold text-white`}>{location.time}</Text>
        </View> */}
      </View>
    ))

  }
  </View>
  )}
</View>

        
        </View>
          </ScrollView>


{/* offer/schedule */}
          <View style={className`flex flex-col gap-3`}>

            <TouchableOpacity
          onPress={() => route.push('/(driver)/create')}
            style={className`w-[361px] h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]  `}>
                <Text style={className`text-white text-[16px]`}>Offer a Ride</Text>
            </TouchableOpacity>

               <TouchableOpacity
                onPress={() => route.push('/(schedule)')}
            style={className`w-[361px] h-[46px] border-[1px] border-[#245AB0] flex items-center justify-center
             rounded-[6px]  bg-white  `}>
                <Text style={className`text-[#245AB0] text-[16px]`}>Schedule a Ride</Text>
            </TouchableOpacity>
            
            

          </View>
    
    </View>

  
    </View>

    </View>
  )
}

export default TripHistory

const styles = StyleSheet.create({})