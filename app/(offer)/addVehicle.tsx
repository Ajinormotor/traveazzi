import { Dimensions, FlatList, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, 
  TouchableOpacity, useWindowDimensions, View } from 'react-native'
import React, { useState } from 'react'
import className from 'twrnc'


// import cancel from "../../assets/images/cancel.png"

import indicator from "../../assets/images/indicator.png"
import Ionicons from '@expo/vector-icons/Ionicons'
import gps from "../../assets/images/location-04.png"
import driver from "../../assets/images/location.png"
import bg from "../../assets/images/map_bg.png"
import marker from "../../assets/images/marker.png"
// 
import { useRouter } from 'expo-router';



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


const AddVehicle = () => {
  
    const width = Dimensions.get('window').width;
    const route = useRouter()


const [carModel, setCarModel] = useState('');
const [carMake, setCarMake] = useState('');
const [carYear, setCarYear] = useState('');
const [carColor, setCarColor] = useState('');
const [plateNumber, setPlateNumber] = useState('');


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



<ScrollView  style={className`flex flex-col gap-4 `}>

<View  style={className` flex flex-col gap-4`}>

{/* Headint txt */}
     <View style={className`flex flex-row items-center  gap-3`}>

            <TouchableOpacity onPress={() => route.back()}>
      {/* <Image source={cancel} alt='' style={className`w-[20px] h-[20px]`   }  /> */}
         <Ionicons name="arrow-back-outline" size={20} color="black" />
    </TouchableOpacity>

      <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-2xl  font-bold`}>Add Vehicles</Text>
        <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>Add your car details below.</Text>
      </View>



     </View>

     <View style={className`flex flex-col gap-4`}>

        <Text style={className`text-[#9C9C9C] font-bold text-sm uppercase`}>Vehicle Information</Text>

        {/* Form */}
        <View style={className`flex flex-col gap-3`}>


{/* car  make & car model */}
            <View style={className`w-full flex flex-row gap-2`}>

  {/* Select Date */}
  <View style={className`flex-1 flex flex-col gap-3`}>
    <Text style={className`text-black font-bold  text-[14px]`}> Car Make</Text>
    <View style={className`bg-[#F0F0F0] h-10 px-3 flex flex-row items-center rounded-[8px]`}>
      {/* <Ionicons name="calendar-outline" size={20} color="black" /> */}
      <TextInput
        style={className`flex-1 `}
        placeholder="Select  make"
        value={carMake}
        onChangeText={setCarMake}
      />
    </View>
  </View>

  {/* Select Time */}
  <View style={className`flex-1 flex flex-col gap-3`}>
 <Text style={className`text-black font-bold  text-[14px]`}>Car Model</Text>
    <View style={className`bg-[#F0F0F0] h-10 px-3 flex flex-row items-center rounded-[8px]`}>
      {/* <Ionicons name="time-outline" size={20} color="black" /> */}
      <TextInput
        style={className`flex-1 `}
        placeholder="e.g Camry"
        value={carModel}
        onChangeText={setCarModel}
      />
    </View>
  </View>

</View>


{/* car  make & car model */}
            <View style={className`w-full flex flex-row gap-2`}>

  {/* Select color */}
  <View style={className`flex-1 flex flex-col gap-3`}>
    <Text style={className`text-black font-bold  text-[14px]`}> Year </Text>
    <View style={className`bg-[#F0F0F0] h-10 px-3 flex flex-row items-center rounded-[8px]`}>
      {/* <Ionicons name="calendar-outline" size={20} color="black" /> */}
      <TextInput
        style={className`flex-1 `}
        placeholder="Select  make"
        value={carYear}
        onChangeText={setCarYear}
      />
    </View>
  </View>

  {/* Select Date */}
  <View style={className`flex-1 flex flex-col gap-3`}>
 <Text style={className`text-black font-bold  text-[14px]`}>Color</Text>
    <View style={className`bg-[#F0F0F0] h-10 px-3 flex flex-row items-center rounded-[8px]`}>
      {/* <Ionicons name="time-outline" size={20} color="black" /> */}
      <TextInput
        style={className`flex-1 `}
        placeholder="e.g Camry"
        value={carColor}
        onChangeText={setCarColor}
      />
    </View>
  </View>


</View>

{/* car  plate Number*/}
            <View style={className`w-full flex flex-row gap-2`}>

  {/* Select color */}
  <View style={className`flex-1 flex flex-col gap-3`}>
    <Text style={className`text-black font-bold  text-[14px]`}> Plate Number</Text>
    <View style={className`bg-[#F0F0F0] h-10 px-3 flex flex-row items-center rounded-[8px]`}>
      {/* <Ionicons name="calendar-outline" size={20} color="black" /> */}
      <TextInput
        style={className`flex-1 `}
        placeholder="e.g. ABC-1234"
        value={plateNumber}
        onChangeText={setPlateNumber}
      />
    </View>
  </View>

  </View>


   {/* Seats */}
     <View style={className`flex flex-col gap-3 py-3`}>

     <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-2xl  font-bold`}>Seats available for passengers</Text>
        <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>
            How many passengers can your vehicle take.</Text>
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


{/* vehcle feature */}

    <View style={className`flex flex-col gap-3 py-3`}>

     <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-2xl  font-bold`}>Vehicle feature</Text>
        <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>
        Select features that makes your ride special. </Text>
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


{/* Submit button */}

              <View style={className`flex flex-col gap-3`}>

            <TouchableOpacity
          onPress={() => route.push('/(offer)')}
            style={className`w-[361px] h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]  `}>
                <Text style={className`text-white text-[16px]`}>Add Vehicle</Text>
            </TouchableOpacity>

            </View>

        </View>

     </View>

</View>

</ScrollView>

</View>
        </ImageBackground>

    </KeyboardAvoidingView>
  )
}

export default AddVehicle

const styles = StyleSheet.create({})