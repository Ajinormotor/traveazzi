import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, 
  TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import className from 'twrnc'
import MapSheetScreen from '@/components/MapSheetScreen';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { useAuthStore } from '@/store/authStore';


import cancel from "../../assets/images/cancel.png"
import Ionicons from '@expo/vector-icons/Ionicons'
import gps from "../../assets/images/location-04.png"
import dropIcon from "../../assets/images/drop_icon.png"
import driver from "../../assets/images/location.png"
import bg from "../../assets/images/map_bg.png"
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


// Mirrors VehicleVerificationStatus from the backend vehicle schema:
// NOT_SUBMITTED | PENDING | VERIFIED | REJECTED
const VEHICLE_STATUS_LABEL: Record<string, string> = {
  NOT_SUBMITTED: 'NOT SUBMITTED',
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

const VEHICLE_STATUS_COPY: Record<string, string> = {
  NOT_SUBMITTED: 'Documents not submitted yet',
  PENDING: 'Awaiting admin approval',
  VERIFIED: 'Ready to offer',
  REJECTED: 'Not approved — check your documents',
};

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

  const { createRide,getAllRides, geocodeAddress, loading } = useDriverRideStore();

  // `loading` from the store only flips once createRide is reached, so it left
  // the button idle through validation and both geocode round-trips. Track the
  // whole submit locally so the spinner is up for the entire attempt.
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = submitting || loading;
  
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
   const [isTimeVisible, setIsTimeVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

const handleConfirm = (date: any) => {
  const formatted = dayjs(date).format("MMM DD, YYYY"); 
  setDepartureDate(formatted);
  setIsVisible(false);
};

 const handleSelect = (vehicle: VehiclePayload) => {
   // Guard the rule in the handler too, not just in the list's `disabled` prop.
   if (vehicle?.vehicleVerificationStatus !== 'VERIFIED') {
     Toast.show({
       type: 'error',
       text1: 'Vehicle not available',
       text2: 'Only a verified vehicle can be offered for a ride.',
     });
     return;
   }
   setSelectedVehicle(`${vehicle.make} ${vehicle.model}`);
   setVehicleId(vehicle._id);
   setDropdownVisible(false);
 };



const handleCreateRide = async () => {
  // Guard against a double-tap firing two offers off one intent.
  if (isSubmitting) return;

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

  setSubmitting(true);

  // Full trace of what is actually being submitted. JSON.stringify is used on
  // the address strings deliberately: it exposes leading/trailing spaces, new
  // lines, zero-width characters and double spaces, all of which look identical
  // in the TextInput but change what the geocoder receives.
  //
  // The token is reported as present/absent and its length only — never its
  // value — so a Metro log or a screen recording cannot leak a live JWT.
  const authState = useAuthStore.getState();
  console.log('[offerRide] SUBMIT', JSON.stringify({
    originAddress,
    destinationAddress,
    originLen: originAddress?.length ?? 0,
    destLen: destinationAddress?.length ?? 0,
    originTrimmedEq: originAddress === originAddress?.trim(),
    destTrimmedEq: destinationAddress === destinationAddress?.trim(),
    departureDate,
    departureTime,
    pricePerSeat,
    selectedSeat,
    vehicleId,
    hasToken: !!authState.token,
    tokenLength: authState.token?.length ?? 0,
    isSubmitting,
  }, null, 2));

  // geocodeAddress throws a GeocodeError carrying the real reason (expired
  // session, 400 from the server, no connection, unparseable body). Resolve
  // both ends through one helper so exactly one toast is shown, and it names
  // the actual cause instead of blaming the address.
  const resolveAddress = async (value: string, label: string) => {
    console.log(`[offerRide] geocoding ${label}: ${JSON.stringify(value)}`);
    try {
      const coords = await geocodeAddress(value);
      console.log(`[offerRide] geocoded ${label}: OK`, coords);
      return coords;
    } catch (err: any) {
      console.log(
        `[offerRide] geocoding ${label}: FAILED`,
        JSON.stringify({
          address: value,
          name: err?.name,
          userMessage: err?.userMessage,
          status: err?.status,
        })
      );
      Toast.show({
        type: 'error',
        text1: `Could not locate ${label}`,
        text2: err?.userMessage ?? 'Please try a fuller address.',
      });
      return null;
    }
  };

  try {
  const originCoords = await resolveAddress(originAddress, 'the pickup address');
  if (!originCoords) {
    return;
  }

  const destinationCoords = await resolveAddress(destinationAddress, 'the drop-off address');
  if (!destinationCoords) {
    return;
  }

  const payload = {
    vehicleId,
    origin: {
      lat: originCoords.lat,
      lon: originCoords.lng,
    },
    destination: {
      lat: destinationCoords.lat,
      lon: destinationCoords.lng,
    },
    originAddress,
    destinationAddress,
    availableSeats,
    departureTime: combinedDate.toISOString(),
    pricePerSeat: price,
    preferences: selectedFeatures,
  };

  console.log('[offerRide] POST /rides payload:', JSON.stringify(payload));

    const success = await createRide(payload);
    console.log('[offerRide] createRide returned:', JSON.stringify(success));
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
  } finally {
    setSubmitting(false);
  }
};


  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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

          <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
           style={className`flex-1`}
           contentContainerStyle={className`gap-4 pb-4`}>

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
                  <AddressAutocomplete
                    placeholder="Pick up address"
                    inputStyle={className`max-w-[85%] w-full bg-transparent text-[16px]
                     `}
                    value={originAddress}
                    onChange={setOriginAddress}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  // onPress={() => route.push(`/(passenger)/rides`)}
                  style={className`w-full h-[46px] bg-[#F6F6F6] rounded-[8px] px-2
                     flex flex-row items-center gap-3`}
                >
                  <Ionicons name="search" size={20} color="black" />
                  <AddressAutocomplete
                    placeholder="Drop off address"
                    value={destinationAddress}
                    onChange={setDestinationAddress}
                    inputStyle={className`max-w-[80%] w-full bg-transparent 
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

                    <TouchableOpacity onPress={() => setIsVisible(true)}
                      style={className`bg-[#F0F0F0] h-10 px-3 flex flex-row items-center rounded-[8px]`}>
                      <Ionicons name="calendar-outline" size={20} color="black" />
                      <Text style={className`flex-1 ml-2 ${departureDate ? 'text-black' : 'text-[#AAAAAA]'}`}>
                        {departureDate || 'Select date'}
                      </Text>
                    </TouchableOpacity>
                  </View>


{/* dEPARTURE tIME */}
                  <View style={className`flex-1`}>
                    <Text style={className`text-[#828282] text-[14px]`}>Select Time</Text>
                    <TouchableOpacity onPress={() => setIsTimeVisible(true)}
                      style={className`bg-[#F0F0F0] h-10 px-3 flex flex-row items-center rounded-[8px]`}>
                      <Ionicons name="time-outline" size={20} color="black" />
                      <Text style={className`flex-1 ml-2 ${departureTime ? 'text-black' : 'text-[#AAAAAA]'}`}>
                        {departureTime || 'Select time'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                </View>

              </View>

               <View>

      <DateTimePickerModal
        isVisible={isVisible}
        mode="date"
        minimumDate={new Date()}
        onConfirm={handleConfirm}
        onCancel={() => setIsVisible(false)}
      />
      <DateTimePickerModal
        isVisible={isTimeVisible}
        mode="time"
        // Only today is time-boxed: picking a future date means any time is
        // valid, and the backend rejects a past departureTime anyway.
        minimumDate={
          departureDate && dayjs(departureDate, 'MMM DD, YYYY').isSame(dayjs(), 'day')
            ? new Date()
            : undefined
        }
        onConfirm={(date: any) => {
          setDepartureTime(dayjs(date).format('hh:mm A'));
          setIsTimeVisible(false);
        }}
        onCancel={() => setIsTimeVisible(false)}
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
          {(vehicles ?? []).length > 0 ? (
            (vehicles ?? []).map((item: any) => {
              // Only a VERIFIED vehicle may be offered. Anything still being
              // reviewed (PENDING), never submitted, or rejected is shown for
              // context but is not selectable.
              const vStatus = item?.vehicleVerificationStatus ?? 'NOT_SUBMITTED';
              const isVerified = vStatus === 'VERIFIED';
              const selected = item._id === vehicleId;

              return (
                <TouchableOpacity
                  key={item._id}
                  disabled={!isVerified}
                  onPress={() => handleSelect(item)}
                  style={className`w-full flex flex-row items-center justify-between gap-2 p-3 border-b border-gray-100
                    ${!isVerified ? 'bg-[#FAFAFA] opacity-60' : ''}`}
                >
                  <View style={className`flex flex-col flex-1`}>
                    <Text
                      style={className`${
                        isVerified ? 'text-black' : 'text-[#AAAAAA]'
                      }`}
                    >
                      {item.make} {item.model}
                      {item.color ? ` · ${item.color}` : ''}
                    </Text>
                    <Text
                      style={className`text-[12px] text-[#AAAAAA] mt-[2px]`}
                    >
                      {item.plateNumber ? `${item.plateNumber} · ` : ''}
                      {isVerified ? 'Tap to select' : VEHICLE_STATUS_COPY[vStatus] ?? 'Not available'}
                    </Text>
                  </View>

                  {!isVerified ? (
                    <View
                      style={className`bg-[#F7F7F7] px-2 h-[24px] flex-row items-center justify-center rounded-[4px]`}
                    >
                      <Text
                        style={className`text-[11px] font-bold text-[#AAAAAA]`}
                      >
                        {VEHICLE_STATUS_LABEL[vStatus] ?? 'UNAVAILABLE'}
                      </Text>
                    </View>
                  ) : selected ? (
                    <View
                      style={className`w-[20px] h-[20px] rounded-full bg-[#28A745] items-center justify-center`}
                    >
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#C4C4C4"
                    />
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={className`p-3 text-[#AAAAAA] text-[14px]`}>
              No vehicles yet — add one in the Vehicle tab
            </Text>
          )}
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
                  disabled={isSubmitting}
                  style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px] ${isSubmitting ? 'opacity-70' : ''}`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={className`text-white text-[16px]`}>
                    Offer Ride</Text>
                  )}
                </TouchableOpacity>
              </View>

            </View>

          </ScrollView>

      </MapSheetScreen>
    </KeyboardAvoidingView>
  );
};

export default CreateRide;

const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
