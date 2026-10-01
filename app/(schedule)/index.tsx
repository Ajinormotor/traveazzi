import { FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, 
  TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import className from 'twrnc'
import dayjs from 'dayjs'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MapSheetScreen from '@/components/MapSheetScreen';
import AddressAutocomplete from '@/components/AddressAutocomplete';


import Ionicons from '@expo/vector-icons/Ionicons'
import gps from "../../assets/images/location-04.png"
import bg from "../../assets/images/map_bg.png"
// 
import { useRouter } from 'expo-router'
import { useDriverRideStore } from '@/store/driverStore'
import Toast from 'react-native-toast-message'



const seatData = [
  {id: "1", value: "1"},   {id: "2", value: "2"}, 
    {id: "3", value: "3"},   {id: "4", value: "4"},   {id: "5", value: "5"},
]



const Schedule = () => {

const [rideDate, setRideDate] = useState<Date | null>(null);
const [rideTime, setRideTime] = useState<Date | null>(null);
const [showDatePicker, setShowDatePicker] = useState(false);
const [showTimePicker, setShowTimePicker] = useState(false);



 const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  // const router = useRouter()

  const handleSelected = (id: string) => {
    setSelectedSeat(prev => (prev === id ? null : id)); 
  };

  
const route = useRouter()
const [origin, setOrigin] = useState('');
const [destination, setDestination] = useState('');

const { geocodeAddress, getRideBySearch } = useDriverRideStore();

const handleSearch = () => { 
   //
};


const handleAvailability = async () => {
  if (!origin || !destination || !rideDate) {
    Toast.show({
      type: 'error',
      text1: 'Origin, destination, and date are required',
    });
    return;
  }

  // One toast, naming the real cause — see the note in create.tsx.
  const resolveAddress = async (value: string, label: string) => {
    try {
      return await geocodeAddress(value);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: `Could not locate ${label}`,
        text2: err?.userMessage ?? 'Please try a fuller address.',
      });
      return null;
    }
  };

  const originCoords = await resolveAddress(origin, 'the origin address');
  if (!originCoords) {
    return;
  }

  const destinationCoords = await resolveAddress(destination, 'the destination address');
  if (!destinationCoords) {
    return;
  }

  const ok = await getRideBySearch({
    origin: { lat: originCoords.lat, lon: originCoords.lng },
    destination: { lat: destinationCoords.lat, lon: destinationCoords.lng },
    departureDate: dayjs(rideDate).format('YYYY-MM-DD'),
    seatsNeeded: selectedSeat ? Number(selectedSeat) : 1,
  });
  if (!ok) return;

  route.push(`/(schedule)/scheduleResult`);
}

  return (

    <KeyboardAvoidingView style={{flex:1}}
   behavior = {Platform.OS === "ios" ? "padding" : "height"}
    >



     <MapSheetScreen
       mode="view"
       fallback={bg}
       initialRatio={0.5}
       minRatio={0.25}
       maxRatio={0.95}
       showMarker
       sheetBackgroundColor="#FFFFFF"
       sheetContentStyle={styles.sheetContent}
     >

<ScrollView  style={className`flex-1`} contentContainerStyle={className`gap-4 pb-4`}>

<View  style={className` flex flex-col gap-4`}>


     <View style={className`flex flex-row items-start justify-between`}>

      <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-2xl  font-bold`}>Schedule a ride</Text>
        <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>Type a city, landmark, or Address...</Text>
      </View>

   <TouchableOpacity
     accessibilityLabel="Go back"
     onPress={() => route.back()}>
       <Ionicons name="arrow-undo-circle-outline" size={20} />
   </TouchableOpacity>

     </View>

     {/* search */}

     <View style={className`flex flex-col gap-3`}>

     <TouchableOpacity style={className`w-[361px] w-full h-[46px] bg-[#F6F6F6] rounded-[8px] w-full flex flex-row items-center 
       px-2 gap-3 `}>
        <Image source={gps}  style={className``}  />
        <AddressAutocomplete  value={origin} onChange={setOrigin} placeholder='Legend Hotel Lagos Airport, Curio' inputStyle={className`max-w-[85%] w-full bg-transparent text-[16px]`}  />
     
     </TouchableOpacity>

        <TouchableOpacity
        style={className`w-[361px] w-full h-[46px] bg-[#F6F6F6] rounded-[8px] w-full flex flex-row items-center 
       px-2  gap-3`}>
        <Ionicons name='search' color="black" size={20} style={className``}  />
        <AddressAutocomplete
        value={destination}
        onChange={setDestination}
        placeholder='University of benin'
        inputStyle={className`max-w-[82%] w-full bg-transparent text-[16px]`}  />
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
    <TouchableOpacity onPress={() => setShowDatePicker(true)}
      style={className`bg-[#F0F0F0] h-10 px-3 flex flex-row items-center rounded-[8px]`}>
      <Ionicons name="calendar-outline" size={20} color="black" />
      <Text style={className`flex-1 ml-2 ${rideDate ? 'text-black' : 'text-[#AAAAAA]'}`}>
        {rideDate ? dayjs(rideDate).format('MMM DD, YYYY') : 'Select date'}
      </Text>
    </TouchableOpacity>
  </View>

  {/* Select Time */}
  <View style={className`flex-1 flex flex-col gap-3`}>
    <Text style={className`text-[#828282] text-[14px]`}>Select Time</Text>
    <TouchableOpacity onPress={() => setShowTimePicker(true)}
      style={className`bg-[#F0F0F0] h-10 px-3 flex flex-row items-center rounded-[8px]`}>
      <Ionicons name="time-outline" size={20} color="black" />
      <Text style={className`flex-1 ml-2 ${rideTime ? 'text-black' : 'text-[#AAAAAA]'}`}>
        {rideTime ? dayjs(rideTime).format('hh:mm A') : 'Select time'}
      </Text>
    </TouchableOpacity>
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

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date: Date) => {
          setRideDate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        // Only today is time-boxed: any time is valid on a future date.
        minimumDate={
          rideDate && dayjs(rideDate).isSame(dayjs(), 'day') ? new Date() : undefined
        }
        onConfirm={(date: Date) => {
          setRideTime(date);
          setShowTimePicker(false);
        }}
        onCancel={() => setShowTimePicker(false)}
      />

     </MapSheetScreen>

        </KeyboardAvoidingView>
  )
}

export default Schedule
const styles = StyleSheet.create({
  sheetContent: {
    padding: 8,
  },
})