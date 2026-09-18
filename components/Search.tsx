import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, 
  TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import className from 'twrnc'
import cancel from "../assets/images/cancel.png"
import indicator from "../assets/images/indicator.png"
import Ionicons from '@expo/vector-icons/Ionicons'
import gps from "../assets/images/location-04.png"
import down from "../assets/images/down.png"
import driver from "../assets/images/location.png"
import { searchData } from '@/constants/data/search'
import { Link, useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { useDriverRideStore } from '@/store/driverStore'


const seatData = [
  {id: "1", value: "1"},  
  {id: "2", value: "2"},  
  {id: "3", value: "3"},  
  {id: "4", value: "4"},  
  {id: "5", value: "5"},
]



const Search = () => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const router = useRouter()

  const handleSelected = (id: string) => {
    setSelectedSeat(prev => (prev === id ? null : id)); 
  };

  
const route = useRouter()
const [destination, setDestination] = useState('');

const handleSearch = () => {
  if (!destination.trim()) return;

    route.push({
      pathname: '/(passenger)/rides',
      params: { q: destination.trim() },
    });

};

const [showMenu, setShowMenu] = useState(false)

const handleToggle = () => {
  setShowMenu(!showMenu)
}

const {logout} = useAuthStore()
const {rides, getAllRides} = useDriverRideStore()

const handleLogout = async() => {
  await logout()
  setShowMenu(!showMenu)
  route.push('/(auth)')

}


  return (
    <View style={className` flex flex-col gap-3`}>

      
   <TouchableOpacity style={className`w-full flex flex-row items-center justify-center`}>
   <Image source={indicator}  alt='' style={className`w-[35px] h-1`}  />
   </TouchableOpacity>



<ScrollView  style={className`flex flex-col gap-4 `}>

<View  style={className` flex flex-col gap-4`}>


     <View style={className`flex flex-row items-start justify-between`}>

      <View style={className`flex flex-col gap-[1px]`}>
        {/* <Text style={className`text-2xl  font-bold`}>Where are you headed?</Text> */}
            <View style={className`flex flex-row items-center gap-2  relative`}>
                <Text style={className`text-black text-2xl font-bold`}>My Trips</Text>
        
        <TouchableOpacity onPress={handleToggle}>
                  <Image source={down} alt=''
                style={className`w-[12px] h-[7px]`}  />
        </TouchableOpacity>
        
        {showMenu && (
          <View style={className`
            absolute top-10 left-0 bg-white rounded-[8px] shadow-sm p-2 gap-3 
            items-center justify-center flex-col w-[60%] z-100 bg-[#fafafa]
            ${showMenu ? 'flex' : 'hidden'}
          `}>
            <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
              <Link href="/(passenger)/home"
              style={className`border-b border-gray-200`}>
              <Text> Home </Text>
               </Link>
            </TouchableOpacity>
        
               <TouchableOpacity onPress={handleLogout}>
            
              <Text style={className`text-red-500 font-bold hover:text-red-300 z-100`}>
                Logout
                </Text>
              
            </TouchableOpacity>
          </View>
        )}
        
            </View>
        <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>
          Type a city, landmark, or Address...
          </Text>
      </View>

    <TouchableOpacity>
      <Image source={cancel} alt='' style={className`w-[20px] h-[20px] hidden`   }  />
    </TouchableOpacity>

     </View>

     {/* search */}

     <View style={className`flex flex-col gap-3`}>

     {/* <TouchableOpacity style={className`w-[361px] w-full h-[46px] bg-[#F6F6F6] rounded-[8px] w-full flex flex-row items-center 
       px-2 gap-3 `}>
        <Image source={gps}  style={className``}  />
        <TextInput  placeholder='Legend Hotel Lagos Airport, Curio'  style={className`max-w-[85%] w-full bg-transparent text-[16px]`}  />
     
     </TouchableOpacity> */}

        <View
        style={className`w-[361px] w-full h-[46px] bg-[#F6F6F6] rounded-[8px] w-full
          flex flex-row items-center  px-2  gap-3`}>
        <Ionicons name='search' color="black" size={20} style={className``}  />
        <TextInput  placeholder='Where are you headed?'
        returnKeyType='search'
        value={destination}
        onChangeText={setDestination}
        onSubmitEditing={handleSearch}
        style={className`max-w-[82%] w-full bg-transparent text-[16px]`}  />
        <Image source={gps}  style={className``}  />

     </View>

     </View>

     
     <View style={className`flex flex-col gap-3 hidden`}>

     <View style={className`flex flex-col gap-[1px]`}>
        <Text style={className`text-2xl  font-bold`}>Seats</Text>
        <Text style={className`text-[14px] text-[#AAAAAA] font-bold`}>
          Type a city, landmark, or Address...</Text>
      </View>

      <View  style={className` w-full  `}>
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



{/* More */}
<View style={className`flex flex-col gap-3`}>

  <TouchableOpacity  >

<Text style={className`text-[12px] font-bold text-[#AAAAAA]`}>
    More
  </Text>
</TouchableOpacity>

     {/* other */}
<View style={className`flex flex-col gap-3`}>
  {
    searchData.map((s) => (
      <View key={s.id}
      style={className`flex flex-row gap-1  `}>

    <TouchableOpacity
        onPress={() => {
          // console.log('Navigating to:', s.path);
          router.push(s.path as any);
        }}
      >
          <Image source={s.img}  
          style={className`w-[20px] h-[20px] mt-1`}  />
        </TouchableOpacity>

<TouchableOpacity
   onPress={() => {
          // console.log('Navigating to:', s.path);
          router.push(s.path as any);
        }}
style={className`flex flex-col gap-1`}>
  <Text style={className`text-[14px] font-bold text-black`}> {s.title} </Text>
  <Text style={className`text-[14px] font-bold text-[#AAAAAA]`}>{s.subtitle}</Text>
  </TouchableOpacity>
        

      </View>
    ))
  }

</View>

</View>

     </View>




     </ScrollView>

    </View>
  )
}

export default Search

const styles = StyleSheet.create({})