import { ActivityIndicator, Dimensions, FlatList, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, 
  TouchableOpacity, useWindowDimensions, View } from 'react-native'
import React, { useState } from 'react'
import className from 'twrnc'


import cancel from "../../assets/images/cancel.png"
import indicator from "../../assets/images/indicator.png"
import Ionicons from '@expo/vector-icons/Ionicons'
import gps from "../../assets/images/location-04.png"
import dropIcon from "../../assets/images/drop_icon.png"
import driver from "../../assets/images/location.png"
import bg from "../../assets/images/map_bg.png"
import marker from "../../assets/images/marker.png"
import priceTag from "../../assets/images/price_tag.png"
// 
import { Link, useRouter } from 'expo-router'
import { useDriverRide } from '@/store/driverRide'
import { create } from 'zustand'
import Toast from 'react-native-toast-message'
import { useSafeAreaInsets } from 'react-native-safe-area-context';



const seatData = [
  {id: "1", value: "1"},   {id: "2", value: "2"}, 
    {id: "3", value: "3"},   {id: "4", value: "4"},   {id: "5", value: "5"},
]

const vehicelFeature = [
{title: 'Air Conditioning'},
 {title: 'Wifi HotSpot'},
  {title: 'Music System'},
 {title: 'Airconditioning'},
   {title: 'Extra Lounge '},
 {title: 'Pet friendly'},
]

const width = Dimensions.get('window').width;

const CreateRide = () => {

const [selectedDate, setSelectedDate] = useState('');
const [pricePerSeat, setPricePerSeat] = useState('');
const [originAddress , setOriginAddress] = useState('')
const [ departureTime, setDepartureTime] = useState('')
const [destinationAddress, setDestinationAddress] = useState('')
const [preferences, setPreferences] = useState('')



 const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  // const router = useRouter()

  const handleSelected = (id: string) => {
    setSelectedSeat(prev => (prev === id ? null : id)); 
  };

  
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
    const handleFeatureToggle = (title: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };
  

  
const route = useRouter()


const handleSearch = () => { 
   //
};

const { createRide, loading } =  useDriverRide()


const handleAvailability = async () => {
  if (!originAddress || !destinationAddress || !selectedDate || !departureTime || !pricePerSeat) {
    Toast.show({
      type: "error",
      text1: "All fields are required",
    });
    return;
  }

  const payload = {
    vehicleId: "605c72ef4e79a3a3e8f2d3b4", // static from Swagger
    origin: {
      lat: 6.5244,
      lon: 3.3792,
    },
    destination: {
      lat: 6.5244,
      lon: 3.3792,
    },
    originAddress,
    destinationAddress,
    departureTime: new Date(`${selectedDate} ${departureTime}`).toISOString(), // ISO format
    pricePerSeat: Number(pricePerSeat),
    preferences: ["No Smoking", "Music allowed"], // static
  };

  try {
    await createRide(payload);

    Toast.show({
      type: "success",
      text1: "Ride created successfully",
    });

    // Reset form after success
    setPricePerSeat('');
    setDepartureTime('');
    setDestinationAddress('');
    setOriginAddress('');
    setSelectedDate('');
    setSelectedSeat(null);

    route.push(`/startRide`);
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Something went wrong",
    });
  }
};


const insets = useSafeAreaInsets();


  return (

    <KeyboardAvoidingView style={{flex:1}}
   behavior = {Platform.OS === "ios" ? "padding" : "height"}
    >



     <ImageBackground
    source={bg} alt=''
    style={className`flex-1 `}
    >

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



<ScrollView 
 style={className`flex flex-col gap-4 `}>

<View  style={className` flex flex-col gap-4`}>


     <View style={className`flex flex-row items-start justify-between`}>

      <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-2xl  font-bold`}>Offer a ride</Text>
        <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>Type a city, landmark, or Address...</Text>
      </View>

    <TouchableOpacity>
      <Image source={cancel} alt='' style={className`w-[20px] h-[20px]`   }  />
    </TouchableOpacity>

     </View>

     {/* search */}

     <View style={className`flex flex-col gap-3`}>

     <TouchableOpacity style={className` w-full h-[46px] bg-[#F6F6F6] rounded-[8px] w-full flex flex-row items-center 
       px-2 gap-3 `}>
        <Image source={gps}  style={className``}  />
        <TextInput  placeholder='Pick up address'  style={className`max-w-[85%]
           w-full bg-transparent text-[16px]`} 
            value={originAddress}
        onChangeText={setOriginAddress} />
     
     </TouchableOpacity>

        <TouchableOpacity  onPress={() =>  route.push(`/searchResult`)}
        style={className` w-full h-[46px] bg-[#F6F6F6] rounded-[8px] w-full flex flex-row items-center 
       px-2  gap-3`}>
        <Ionicons name='search' color="black" size={20} style={className``}  />
        <TextInput  placeholder='Drop off address'  
        value={destinationAddress}
        onChangeText={setDestinationAddress}
        onSubmitEditing={handleSearch}
        style={className`max-w-[80%] w-full bg-transparent text-[16px]`}  />
        <Image source={dropIcon}  style={className``}  />
        
     </TouchableOpacity>

     </View>

     

     {/* Seats */}
     <View style={className`flex flex-col gap-3 py-3`}>

     <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-[16px]  font-bold`}>Seats</Text>
        <Text style={className`text-[12px] text-[#AAAAAA] font-bold`}>Type a city, landmark, or Address...</Text>
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


    <View style={className`flex flex-col `}>
        <Text style={className`text-[16px]  font-bold`}>Date & Time</Text>
        <Text style={className`text-[12px] text-[#AAAAAA] font-bold`}>
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
        value={departureTime}
        onChangeText={setDepartureTime}
      />
    </View>
  </View>

</View>


{/* car  plate Number*/}
            <View style={className`w-full flex flex-row gap-2`}>

  {/* Select Price */}
  <View style={className`flex-1 flex flex-col gap-3`}>


     <View style={className`flex flex-col `}>
    <Text style={className`text-black font-bold  text-[16px]`}> Price per seat</Text>

  <Text style={className`text-[12px] text-[#AAAAAA] font-bold`}>
        Set the amount you want to charge passengers for each available seat.</Text>
        </View>

    <View style={className`bg-[#F0F0F0] h-10 px-3 flex flex-row items-center rounded-[8px] `}>
      {/* <Ionicons name="calendar-outline" size={20} color="black" /> */}
            <Image source={priceTag} alt='' style={className`w-[20px] h-[20px]`   }  />
      <TextInput
        style={className`flex-1 ml-2 `}
        placeholder="Enter price"
        value={pricePerSeat}
        onChangeText={setPricePerSeat}
      />
    </View>

  </View>

  </View>


{/* vehcle feature */}

    <View style={className`flex flex-col gap-3 py-3`}>

     <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-2xl  font-bold`}>Ride Preference</Text>
        <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>
   Set the amount you want to charge passengers for each available seat. </Text>
      </View>

    <View style={className`flex flex-wrap flex-row justify-between gap-y-3`}>
  {vehicelFeature.map((vehic, index) => {
    const isSelected = selectedFeatures.includes(vehic.title);
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleFeatureToggle(vehic.title)}
        style={className`w-[48%] flex-row items-center gap-2`}
      >
        {/* Custom Rounded Checkbox */}
        <View
          style={[
            className`w-5 h-5 rounded-full border-[2px] border-[#ccc] items-center justify-center`,
            {
              backgroundColor: isSelected ? '#245AB0' : 'white',
              borderColor: isSelected ? '#245AB0' : '#ccc',
            },
          ]}
        >
          {isSelected && (
            <View style={className`w-2 h-2 rounded-full bg-white`} />
          )}
        </View>

        <Text style={className`text-black text-base`}>{vehic.title}</Text>
      </TouchableOpacity>
    );
  })}
</View>

      </View>

  {/* Button */}
  <View style={className`w-full flex items-center justify-center`}>
    <TouchableOpacity onPress={handleAvailability}
      style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]`}>

         {loading ?
        <ActivityIndicator color="#fff" />
        :
      <Text style={className`text-white text-[16px]`}>Offer Ride</Text>
         }
    </TouchableOpacity>
  </View>

</View>



</View>

     </View>




     </ScrollView>

    </View>
    </ImageBackground>Wisd

        </KeyboardAvoidingView>
  )
}

export default  CreateRide

const styles = StyleSheet.create({})