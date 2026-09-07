import { Dimensions, FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, 
  TouchableOpacity, useWindowDimensions, View } from 'react-native'
import React, { useState } from 'react'
import className from 'twrnc'
import MapEmbed from '@/components/MapEmbed';


import cancel from "../../assets/images/cancel.png"
import indicator from "../../assets/images/indicator.png"
import Ionicons from '@expo/vector-icons/Ionicons'
import gps from "../../assets/images/location-04.png"
import driver from "../../assets/images/location.png"
import bg from "../../assets/images/map_bg.png"
import marker from "../../assets/images/marker.png"
// 
import { Link, useRouter } from 'expo-router'



const seatData = [
  {id: "1", value: "1"},   {id: "2", value: "2"}, 
    {id: "3", value: "3"},   {id: "4", value: "4"},   {id: "5", value: "5"},
]


const width = Dimensions.get('window').width;

const Schedule = () => {

const [selectedDate, setSelectedDate] = useState('');
const [selectedTime, setSelectedTime] = useState('');



 const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  // const router = useRouter()

  const handleSelected = (id: string) => {
    setSelectedSeat(prev => (prev === id ? null : id)); 
  };

  
const route = useRouter()
const [destination, setDestination] = useState('');

const handleSearch = () => { 
   //
};


const handleAvailability = () => {
 route.push(`/(schedule)/scheduleResult`);
}

  return (

    <KeyboardAvoidingView style={{flex:1}}
   behavior = {Platform.OS === "ios" ? "padding" : "height"}
    >



     <View style={className`flex-1 `}>
     <MapEmbed mode="view" fallback={bg} />

        <View style={className`h-[30%] relative `}>

<TouchableOpacity style={className`absolute left-[50px] bottom-[50px]`} >
<Image source={marker}  alt='' style={className`w-[100px] h-[100px]`}   />
</TouchableOpacity>
</View>

    <View style={[className`flex-1 flex flex-col gap-3 bg-white p-2 h-1/2`,
        {width}
    ]}>

      
   <TouchableOpacity style={className`w-full flex flex-row items-center justify-center`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>



<ScrollView  style={className`flex flex-col gap-4 `}>

<View  style={className` flex flex-col gap-4`}>


     <View style={className`flex flex-row items-start justify-between`}>

      <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-2xl  font-bold`}>Schedule a ride</Text>
        <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>Type a city, landmark, or Address...</Text>
      </View>

    <TouchableOpacity>
      <Image source={cancel} alt='' style={className`w-[20px] h-[20px]`   }  />
    </TouchableOpacity>

     </View>

     {/* search */}

     <View style={className`flex flex-col gap-3`}>

     <TouchableOpacity style={className`w-[361px] w-full h-[46px] bg-[#F6F6F6] rounded-[8px] w-full flex flex-row items-center 
       px-2 gap-3 `}>
        <Image source={gps}  style={className``}  />
        <TextInput  placeholder='Legend Hotel Lagos Airport, Curio collection'  style={className`max-w-[85%] w-full bg-transparent text-[16px]`}  />
     
     </TouchableOpacity>

        <TouchableOpacity  onPress={() =>  route.push(`/(schedule)/scheduleResult`)}
        style={className`w-[361px] w-full h-[46px] bg-[#F6F6F6] rounded-[8px] w-full flex flex-row items-center 
       px-2  gap-3`}>
        <Ionicons name='search' color="black" size={20} style={className``}  />
        <TextInput  placeholder='University of benin'  
        value={destination}
        onChangeText={setDestination}
        onSubmitEditing={handleSearch}
        style={className`max-w-[82%] w-full bg-transparent text-[16px]`}  />
        <Image source={gps}  style={className``}  />
        
     </TouchableOpacity>

     </View>

     

     {/* Seats */}
     <View style={className`flex flex-col gap-3 py-3`}>

     <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-2xl  font-bold`}>Seats</Text>
        <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>Type a city, landmark, or Address...</Text>
      </View>

      <View  style={className` w-full`}>
        <FlatList 
        data={seatData}
        horizontal
        contentContainerStyle={className`gap-3`}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={ ({item}) => (
          <TouchableOpacity onPress={() => handleSelected(item.id)}
           style={[className`flex flex-row w-[36px] h-[36px] rounded-full items-center justify-center `, {
            backgroundColor: selectedSeat === item.id ? "black" : "#F0F0F0",
            color: selectedSeat ? "white" : "black"
          }]}>
          <Text style={[className`text-center font-bold text-lg`, 
           { color: selectedSeat === item.id ? "white" : "black" }]}>{item.value}</Text>
        </TouchableOpacity>
  )}

        />
      </View>

     </View>


{/* availability form */}
<View style={className`flex flex-col gap-3`}>


    <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-2xl  font-bold`}>Date & Time</Text>
        <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>
            Select when you would like yor ride to arrive — date and time.</Text>
      </View>


<View style={className`flex flex-col gap-5`}>

  {/* Date & Time Row */}
<View style={className`w-full flex flex-row gap-2`}>

  {/* Select Date */}
  <View style={className`flex-1 flex flex-col gap-3`}>
    <Text style={className`text-[#828282] text-[14px]`}>Select Date</Text>
    <View style={className`bg-[#F0F0F0] h-10 px-3 flex flex-row items-center rounded-[8px]`}>
      <Ionicons name="calendar-outline" size={20} color="black" />
      <TextInput
        style={className`flex-1 ml-2`}
        placeholder="May 5 2024"
        value={selectedDate}
        onChangeText={setSelectedDate}
      />
    </View>
  </View>

  {/* Select Time */}
  <View style={className`flex-1 flex flex-col gap-3`}>
    <Text style={className`text-[#828282] text-[14px]`}>Select Time</Text>
    <View style={className`bg-[#F0F0F0] h-10 px-3 flex flex-row items-center rounded-[8px]`}>
      <Ionicons name="time-outline" size={20} color="black" />
      <TextInput
        style={className`flex-1 ml-2`}
        placeholder="09:51 AM"
        value={selectedTime}
        onChangeText={setSelectedTime}
      />
    </View>
  </View>

</View>


  {/* Button */}
  <View style={className`w-full flex items-center justify-center`}>
    <TouchableOpacity onPress={handleAvailability}
      style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]`}>
      <Text style={className`text-white text-[16px]`}>Check Availability</Text>
    </TouchableOpacity>
  </View>

</View>



</View>

     </View>




     </ScrollView>

    </View>
    </View>

        </KeyboardAvoidingView>
  )
}

export default Schedule
const styles = StyleSheet.create({})