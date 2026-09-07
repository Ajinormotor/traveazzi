import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import className from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { useAuthStore } from "@/store/authStore";
import { ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";

import { Picker } from "@react-native-picker/picker";

const Signup = () => {
  const router = useRouter();
  const { loading, createProfile, token } = useAuthStore();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [portalType, setPortalType] = useState<"DRIVER" | "PASSENGER">("PASSENGER");

  const handleSubmit = async () => {
    if (!password || password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password must be at least 6 characters",
      });
      return;
    }
    const success = await createProfile({
      firstName,
      lastName,
      gender,
      password,
      confirmPassword,
      portalType,
    });

    if (!success) return;

    router.replace('/(auth)');
  };

  return (
    <KeyboardAvoidingView
    style={{ flex: 1}}
    behavior={Platform.OS === "ios" ? "padding" : "height"}>

    <View style={className`flex-1 p-2 bg-white`}>
      <View style={className`flex flex-col gap-4 pt-8`}>
        <View style={className`flex flex-col gap-3`}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="black" />
          </TouchableOpacity>
          {/* <Text style={className`text-[24px] font-bold`} > Log in</Text> */}
        </View>

        <View style={className`flex flex-col gap-4`}>
          <View style={className`flex flex-col `}>
            <Text style={className`text-[24px] font-bold`}>
              {" "}
              Create Profile
            </Text>

            <Text style={className`text-[#AAAAAA] text-[12px]`}>
              Please fill in your information to create a new account{" "}
            </Text>
          </View>

          <View style={className`flex flex-col gap-3`}>
            <View style={className`flex flex-col gap-4`}>
              {/* First Name */}
              <View
                style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px] flex flex-row items-center p-1 gap-3`}
              >
                <TextInput
                  placeholder="First Name"
                  style={className`w-[60%]`}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>

              {/* last Name */}
              <View
                style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px] flex flex-row items-center p-1 gap-3`}
              >
                <TextInput
                  placeholder="Last Name"
                  style={className`w-[60%]`}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>

              {/* Gender */}
              {/* <View style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px] flex flex-row items-center p-1 gap-3`}>
            <TextInput  
            placeholder='Gender'
            style={className`w-[60%]`}
               value={gender}
            onChangeText={setGender}
            />
        </View> */}

              <View
                style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px] justify-center`}
              >
                <Picker
                  selectedValue={gender}
                  onValueChange={(itemValue) => setGender(itemValue)}
                  style={className`text-[14px] text-black`}
                  dropdownIconColor="#000"
                >
                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                </Picker>
              </View>

              <View
                style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px] flex flex-row items-center p-1 gap-3`}
              >
                <TextInput
                  placeholder="Password"
                  secureTextEntry
                  autoCapitalize="none"
                  style={className`w-[60%]`}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* confirm Passord */}

              <View
                style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px] flex flex-row items-center p-1 gap-3`}
              >
                <TextInput
                  placeholder="Confirm Password"
                  secureTextEntry
                  autoCapitalize="none"
                  style={className`w-[60%]`}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {/* Role selector */}
              <View style={className`flex flex-row gap-3`}>
                <TouchableOpacity
                  onPress={() => setPortalType("PASSENGER")}
                  style={className`flex-1 h-[46px] rounded-[8px] flex items-center justify-center ${
                    portalType === "PASSENGER"
                      ? "bg-[#245AB0]"
                      : "bg-[#F0F0F0]"
                  }`}
                >
                  <Text
                    style={className`text-[16px] ${
                      portalType === "PASSENGER"
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    Passenger
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPortalType("DRIVER")}
                  style={className`flex-1 h-[46px] rounded-[8px] flex items-center justify-center ${
                    portalType === "DRIVER" ? "bg-[#245AB0]" : "bg-[#F0F0F0]"
                  }`}
                >
                  <Text
                    style={className`text-[16px] ${
                      portalType === "DRIVER" ? "text-white" : "text-black"
                    }`}
                  >
                    Driver
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* No account */}
            {/* <View style={className`flex flex-row `}>
<Text style={className`text-[14px] font-medium gap-1 flex flex-row`}> 
  Already have an account?  </Text>

<TouchableOpacity 
>
  <Text style={className`text-[#007BFF] text-[14px] `}>Sign up </Text>

</TouchableOpacity>
</View> */}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]  `}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={className`text-white text-[16px]`}>Create</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* google,email */}
      </View>
    </View>
       </KeyboardAvoidingView>
  );
};

export default Signup;

const styles = StyleSheet.create({});

{
  /* Seperator */
}
//    <View style={className`flex flex-row items-center gap-2`}>

//     <View style={className`bg-gray-300 h-[2px] max-w-[45%] w-full `}></View>

//   <Text> Or</Text>

//  <View style={className`bg-gray-300 h-[2px] max-w-[45%]  w-full`}></View>

//    </View>

//    <View style={className`flex flex-col gap-[10px] w-full`}>

//       <TouchableOpacity
//       style={className`flex flex-row items-center justify-center bg-[#F6F6F6]
//       w-full h-[46px] rounded-[8px] py-1 gap-[10px]`}>
//           <Image source={apple} alt=''
//           style={className`w-[20px] h-[20px]`}  />
//           <Text style={className`text-[16px] text-black`}>Continue with Apple</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//       style={className`flex flex-row items-center justify-center bg-[#F6F6F6]
//       w-full h-[46px] rounded-[8px] py-1 gap-[10px]`}>
//           <Image source={google} alt=''
//           style={className`w-[20px] h-[20px]`}  />
//           <Text style={className`text-[16px] text-black`}>Continue with Google</Text>
//       </TouchableOpacity>

//       {/* <TouchableOpacity
//       style={className`flex flex-row items-center justify-center bg-[#F6F6F6]
//       w-full h-[46px] rounded-[8px] py-1 gap-[10px]`}>
//           <Image source={email} alt=''
//           style={className`w-[20px] h-[20px]`}  />
//           <Text style={className`text-[16px] text-black`}>Continue with Email</Text>
//       </TouchableOpacity> */}

//    </View>

{
  /* Text */
}
//  <View>
//   <Text style={className`text-[12px]`}>
//     By proceeding, I acknowledge that I have read and agree to the terms of the{' '}
//     <Text style={className`text-[#8C8C8C] underline`}>User Agreement</Text> and consent to the processing of my information in accordance with the{' '}
//     <Text style={className`text-[#8C8C8C] underline`}>Privacy Policy.</Text>
//   </Text>
// </View>
