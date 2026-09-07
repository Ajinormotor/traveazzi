import { ActivityIndicator, Dimensions, FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, 
  TouchableOpacity, useWindowDimensions, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import className from 'twrnc'
import MapEmbed from '@/components/MapEmbed';


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
import { useDriverRideStore } from '@/store/driverStore'
import { create } from 'zustand'
import Toast from 'react-native-toast-message'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import DateTimePickerModal from "react-native-modal-datetime-picker";
import { VehiclePayload } from '@/lib/interface/vehicle.type'



dayjs.extend(customParseFormat);



const seatData = [
  { id: '1', value: '1' },
  { id: '2', value: '2' },
  { id: '3', value: '3' },
  { id: '4', value: '4' },
  { id: '5', value: '5' },
];

const vehicelFeature = [
  { title: 'Air Conditioning' },
  { title: 'Wifi HotSpot' },
  { title: 'Music System' },
  { title: 'Airconditioning' },
  { title: 'Extra Lounge ' },
  { title: 'Pet friendly' },
];

const width = Dimensions.get('window').width;

const CreateRide = () => {
 
  const [pricePerSeat, setPricePerSeat] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [departureTime, setDepartureTime] = useState('');
    const [departureDate, setDepartureDate] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

   const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const { createRide,getAllRides, loading } = useDriverRideStore();
  
  const { allVehicle , vehicles} = useDriverRideStore()
  useEffect(() => {
      allVehicle()
  }, [allVehicle])

  // console.log('vehicle Id:', vehicleId)
  
  const route = useRouter();
  const insets = useSafeAreaInsets();

  const handleSelected = (id: string) => {
    setSelectedSeat(prev => (prev === id ? null : id));
  };

  const handleFeatureToggle = (title: string) => {
    setSelectedFeatures(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

   const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

const handleConfirm = (date: any) => {
  const formatted = dayjs(date).format("MMM DD, YYYY"); 
  setDepartureDate(formatted);
  setIsVisible(false);
};

 const handleSelect = (vehicle: VehiclePayload) => {
    setSelectedVehicle(`${vehicle.make} ${vehicle.model}`);
    setVehicleId(vehicle._id);
    setDropdownVisible(false);
  };



const handleCreateRide = async () => {
  // Validate required fields
  if (
    !originAddress ||
    !destinationAddress ||
    !departureTime ||
    !departureDate ||
    !pricePerSeat ||
    !selectedSeat ||
    !vehicleId
  ) {
    Toast.show({
      type: 'error',
      text1: 'All fields are required',
    });
    return;
  }

 

  // Validate and parse date
//  console.log('Departure date:', departureDate);
// console.log('Departure time:', departureTime);

const rawDateTimeString = `${departureDate.trim()} ${departureTime.trim()}`;
// console.log('Raw date-time string:', rawDateTimeString);

// Must match exactly the format used above
// const combinedDate = dayjs(rawDateTimeString, 'MMM DD, YYYY hh:mma', true);
// const combinedDate = dayjs(rawDateTimeString, 'MMM DD, YYYY HH:mm', true);
const combinedDate = dayjs(rawDateTimeString, 'MMM DD, YYYY hh:mm A', true);



if (!combinedDate.isValid()) {
  Toast.show({
    type: 'error',
    text1: 'Invalid date or time format',
  });
  console.log('Failed to parse:', rawDateTimeString);
  return;
}

// console.log('Parsed ISO:', combinedDate.toISOString());


// console.log('Combined:', combinedDate);

  // Validate numbers
  const availableSeats = Number(selectedSeat);
  const price = Number(pricePerSeat);

  if (isNaN(availableSeats) || isNaN(price) || price < 0) {
    Toast.show({
      type: 'error',
      text1: 'Invalid price or seat number',
    });
    return;
  }

  // Test point 2
  // Toast.show({
  //   type: 'success',
  //   text1: 'Clicked two',
  // });

  const payload = {
    vehicleId,
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
    availableSeats,
    departureTime: combinedDate.toISOString(),
    pricePerSeat: price,
    preferences: selectedFeatures,
  };

  // console.log('Details being sent:', payload);

  try {


    const success = await createRide(payload);
    await getAllRides()

    // console.log("Ride creation finished");

    // Toast.show({
    //   type: 'success',
    //   text1: 'Ride created successfully!',
    // });




        if(success) {

   setPricePerSeat('');
    setOriginAddress('');
    setDepartureTime('');
    setDepartureDate('');
    setDestinationAddress('');
    setSelectedSeat(null);
    setSelectedFeatures([]);

    setTimeout(() => {
      return route.push(`/(driver)`)
    }, 500);
    }
 






  } catch (error) {
    console.error("Ride creation failed:", error);
    Toast.show({
      type: 'error',
      text1: 'Failed to create ride. Please try again.',
    });
  }
};


  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={className`flex-1`}>
      <MapEmbed mode="view" fallback={bg} />
        <View style={className`h-[30%] relative`}>
          <TouchableOpacity style={className`absolute left-[50px] bottom-[50px]`}>
            <Image source={marker} style={className`w-[100px] h-[100px]`} />
          </TouchableOpacity>
        </View>

        <View style={[className`flex-1 flex flex-col gap-3 bg-white p-2 h-1/2`, { width }]}>

          <TouchableOpacity
      
           style={className`w-full flex flex-row items-center justify-center`}>
            <Image source={indicator} style={className`w-[35px] h-1`} />

         
          </TouchableOpacity>

          <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
           style={className`flex flex-col gap-4`}>

            <View style={className`flex flex-col gap-4`}>
              
              <View style={className`flex flex-row items-start justify-between`}>
                <View style={className`flex flex-col gap-[1px]`}>
                  <Text style={className`text-2xl font-bold`}>Offer a ride</Text>
                  <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>
                    Type a city, landmark, or Address...
                  </Text>
                </View>

                <TouchableOpacity
                    onPress={() => route.back()}>
                  {/* <Image source={cancel} style={className`w-[20px] h-[20px]`} /> */}
                     <Ionicons name="arrow-undo-circle-outline"  size={20} />
                </TouchableOpacity>

              </View>

              {/* Address Inputs */}
              <View style={className`flex flex-col gap-3`}>
                <TouchableOpacity style={className`w-full h-[46px] bg-[#F6F6F6] rounded-[8px] px-2 flex flex-row items-center gap-3`}>
                  <Image source={gps} />
                  <TextInput
                    placeholder="Pick up address"
                    style={className`max-w-[85%] w-full bg-transparent text-[16px]
                     `}
                    value={originAddress}
                    onChangeText={setOriginAddress}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  // onPress={() => route.push(`/(passenger)/rides`)}
                  style={className`w-full h-[46px] bg-[#F6F6F6] rounded-[8px] px-2
                     flex flex-row items-center gap-3`}
                >
                  <Ionicons name="search" size={20} color="black" />
                  <TextInput
                    placeholder="Drop off address"
                    value={destinationAddress}
                    onChangeText={setDestinationAddress}
                    style={className`max-w-[80%] w-full bg-transparent 
                      text-[16px] `}
                  />
                  <Image source={dropIcon} />
                </TouchableOpacity>
              </View>

              {/* Seats */}
              <View style={className`flex flex-col gap-3 py-3`}>
                <Text style={className`text-[16px] font-bold`}>Seats</Text>
                <FlatList
                  data={seatData}
                  horizontal
                  contentContainerStyle={className`gap-3`}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        handleSelected(item.id);
                      }}
                      style={[
                        className`w-[36px] h-[36px] rounded-full items-center justify-center`,
                        {
                          backgroundColor: selectedSeat === item.id ? 'black' : '#F0F0F0',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          className`text-center font-bold text-lg`,
                          { color: selectedSeat === item.id ? 'white' : 'black' },
                        ]}
                      >
                        {item.value}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* Date & Time */}
              <View style={className`flex flex-col gap-5`}>

                <View style={className`flex flex-row gap-2`}>


{/* depature Data */}
                  <View style={className`flex-1`}>

                    <Text style={className`text-[#828282] text-[14px]`}>
                      Select Date</Text>

                    <View style={className`bg-[#F0F0F0] h-10 px-3 flex-row items-center rounded-[8px]`}>
                  <TouchableOpacity onPress={() => setIsVisible(true)}>
        <Ionicons name="calendar-outline" size={20} color="black" />
      </TouchableOpacity>
                      <TextInput
                        placeholder={currentDate}
                        value={departureDate}
                        onChangeText={setDepartureDate}
                        style={className`flex-1 ml-2`}
                      />
                    </View>
                  </View>


{/* dEPARTURE tIME */}
                  <View style={className`flex-1`}>
                    <Text style={className`text-[#828282] text-[14px]`}>Select Time</Text>
                    <View style={className`bg-[#F0F0F0] h-10 px-3 flex-row items-center rounded-[8px]`}>
                      <Ionicons name="time-outline" size={20} color="black" />
                      <TextInput
                        placeholder="09:00 AM"
                        value={departureTime}
                        onChangeText={setDepartureTime}
                        style={className`flex-1 ml-2  `}
                      />
                    </View>
                  </View>

                </View>

              </View>

               <View>

      <DateTimePickerModal
        isVisible={isVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setIsVisible(false)}
      />
    </View>

              {/* Price */}
              <View style={className`flex-1 flex-col gap-1`}>
                <Text style={className`text-black font-bold text-[16px]`}> Price per seat</Text>

                <Text style={className`text-[12px] text-[#AAAAAA] font-bold`}>
                  Set the amount you want to charge passengers for each available seat.
                </Text>

                <View style={className`bg-[#F0F0F0] h-10 px-3 flex-row items-center rounded-[8px] mt-1`}>
                  <Image source={priceTag} style={className`w-[20px] h-[20px]`} />
                  <TextInput
                    placeholder="Enter price"
                    value={pricePerSeat}
                    onChangeText={setPricePerSeat}
                    keyboardType="numeric"
                    style={className`flex-1 ml-2`}
                  />
                </View>
              </View>

              {/* vehicle Id */}


    <View style={className`flex flex-col gap-1 w-full`}>
      <Text style={className`text-black font-bold text-[16px]`}>
        Select Vehicle
      </Text>

      {/* Dropdown Trigger */}
      <TouchableOpacity
        onPress={() => setDropdownVisible(!dropdownVisible)}
        style={className`bg-[#F0F0F0] h-10 px-3 flex-row items-center justify-between rounded-[8px] mt-1`}
      >
        <Text style={className`text-black`}>
          {selectedVehicle || "Choose a vehicle"}
        </Text>
        <Ionicons
          name={dropdownVisible ? "chevron-up" : "chevron-down"}
          size={20}
          color="#245AB0"
        />
      </TouchableOpacity>

      {/* Dropdown List */}
      {dropdownVisible && (
        <View
          style={className`bg-white border border-gray-300 rounded-[8px] mt-2`}
        >
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={className`p-3 border-b border-gray-100`}
              >
                <Text style={className`text-black`}>
                  {item.make} {item.model}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

 
    </View>
  


              {/* Preferences */}
              <View style={className`flex flex-col gap-1 py-3`}>
  <Text style={className`text-black font-bold text-[16px]`}> Ride Preference</Text>
                <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>
                  Set ride preferences for your passengers.
                </Text>

                <View style={className`flex flex-wrap flex-row justify-between gap-y-3`}>
                  {vehicelFeature.map((vehic, index) => {
                    const isSelected = selectedFeatures.includes(vehic.title);
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleFeatureToggle(vehic.title)}
                        style={className`w-[48%] flex-row items-center gap-2`}
                      >
                        <View
                          style={[
                            className`w-5 h-5 rounded-full border-[2px] border-[#ccc] items-center justify-center`,
                            {
                              backgroundColor: isSelected ? '#245AB0' : 'white',
                              borderColor: isSelected ? '#245AB0' : '#ccc',
                            },
                          ]}
                        >
                          {isSelected && <View style={className`w-2 h-2 rounded-full bg-white`} />}
                        </View>
                        <Text style={className`text-black text-base`}>{vehic.title}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Button */}
              <View style={className`w-full flex items-center justify-center`}>
                <TouchableOpacity
                  onPress={handleCreateRide}
                  style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]`}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={className`text-white text-[16px]`}>
                    Offer Ride</Text>
                  )}
                </TouchableOpacity>
              </View>

            </View>

          </ScrollView>

        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateRide;
