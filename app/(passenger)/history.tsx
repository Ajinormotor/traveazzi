import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import bg from "../../assets/images/map_bg.png";
import className from "twrnc";
import marker from "../../assets/images/marker.png";
import down from "../../assets/images/down.png";
import indicator from "../../assets/images/indicator.png";
import cancel from "../../assets/images/cancel.png";
import up from "../../assets/images/up.png";
import downs from "../../assets/images/down_arrow.png";
import dayjs from "dayjs";
import { Link, router, useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useDriverRideStore } from "@/store/driverStore";
import { getStatusColor } from "@/constants/statusColor";


const History = () => {

  const [showMenu, setShowMenu] = useState(false);
  const route = useRouter();

   const handleLogout = async () => {
    await logout();
    setShowMenu(!showMenu);
    route.push("/(auth)");
  };
  
  const handleToggle = () => {
    setShowMenu(!showMenu);
  };


  const { logout } = useAuthStore();
    const { rides, getAllRides } = useDriverRideStore();


  return (
    <ImageBackground source={bg} style={className`flex-1`}>
      {/* Map section */}
      <View style={className`h-[15%] relative`}>
        <TouchableOpacity style={className`absolute left-[50px] bottom-[50px]`}>
          <Image source={marker} style={className`w-[100px] h-[100px]`} />
        </TouchableOpacity>
      </View>

      {/* Bottom section */}
      <View style={className`h-[85%] bg-[#FAFAFA] flex-col rounded-t-[30px] p-1`}>
        
        <View style={className`flex flex-col gap-4 w-full bg-white h-full p-3`}>
          {/* Top bar */}
          <TouchableOpacity style={className`w-full flex items-center justify-center`}>
            <Image source={indicator} style={className`w-[35px] h-1`} />
          </TouchableOpacity>

          {/* Header */}
          <View style={className`flex flex-row items-center justify-between`}>
            <View style={className`flex flex-row items-center gap-2 relative`}>
              <Text style={className`text-black text-2xl font-bold`}>
                Trip History
              </Text>

              <TouchableOpacity onPress={handleToggle}>
                <Image source={down} style={className`w-[12px] h-[7px]`} />
              </TouchableOpacity>

              {showMenu && (
                <View
                  style={className`
                    absolute top-10 left-0 bg-white rounded-[8px] shadow-sm p-2 gap-3 
                    items-center justify-center flex-col w-full z-100
                  `}
                >
                  <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
                    <Link href="/(passenger)" style={className`border-b border-gray-200`}>
                      <Text>Home</Text>
                    </Link>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleLogout}>
                    
                    <Text style={className`text-red-500 font-bold`}>
                      Logout
                    </Text>

                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={() => route.back()}>
              <Image source={cancel} style={className`w-[20px] h-[20px] hidden`} />
            </TouchableOpacity>
          </View>

   

          {/* Ride List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={className`flex flex-col gap-3 min-h-[200px]`}
          >
            <View style={className`mt-3`}>
              {rides && rides.length > 0 ? (
                <View style={className`flex flex-col gap-4`}>
                  {rides.map((rider: any) => (
                    <TouchableOpacity
                      key={rider._id}
                      onPress={() => router.push(`/${rider._id}/startRide`)}
                    >
                      <View
                        style={className`border border-[#EBEBEB] rounded-[8px] bg-white`}
                      >
                        <View style={className`flex flex-col px-3`}>

                             {/* Status */}
                          <View
                            style={[
                              className`py-1 px-3 rounded-full self-start mt-3 `,
                              {
                                backgroundColor: getStatusColor(rider.status),
                              },
                            ]}
                          >
                            <Text style={className`text-white text-xs font-bold`}>
                              {rider.status}
                            </Text>
                          </View>
                          

                          {/* Origin */}
                          <View style={className`flex flex-row gap-1 pt-3`}>
                            <Image source={up} style={className``} />
                            <Text style={className`text-[14px] font-bold`}>
                              {rider.originAddress}
                            </Text>
                          </View>

                          {/* Time and Price */}
                          <View
                            style={className`flex flex-row items-center gap-3 mt-3`}
                          >
                            <View
                              style={className`rounded-lg flex items-center justify-center max-w-[133px]
                                h-[32px] w-full bg-[#F0F0F0] gap-1 rounded-[8px]`}
                            >
                              <Text
                                style={className`text-[12px] font-bold text-[#8C8C8C]`}
                              >
                                {dayjs(rider.departureTime).format(
                                  "MMM D, YYYY h:mm A"
                                )}
                              </Text>
                            </View>

                            <View style={className`flex-1 h-[2px] bg-[#ECECEC]`} />

                            <Text
                              style={className`text-[#008000] text-sm font-semibold`}
                            >
                              NGN {rider.pricePerSeat}
                            </Text>
                          </View>

                          {/* Destination */}
                          <View style={className`flex flex-row gap-1 py-3`}>
                            <Image source={downs} style={className``} />
                            <Text style={className`text-[14px] font-bold`}>
                              {rider.destinationAddress}
                            </Text>
                          </View>

                       
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View
                  style={className`flex-1 flex items-center justify-center min-h-[200px]`}
                >
                  <Text
                    style={className`text-[#AAAAAA] text-2xl font-bold text-center`}
                  >
                    No rides available
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

     
        </View>

      </View>

    </ImageBackground>
  );
}

export default History