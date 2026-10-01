import {
  ActivityIndicator,
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

const Forgotpassword = () => {
  const router = useRouter();
  const { loading, forgotPassword, resetPassword } = useAuthStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSendCode = async () => {
    if (!email) return;
    const ok = await forgotPassword(email);
    if (ok) setStep(2);
  };

  const handleReset = async () => {
    if (!code || !password) return;
    const ok = await resetPassword(code, password);
    if (ok) router.replace("/(auth)");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={className`flex-1 p-2 bg-white`}>
        <View style={className`flex flex-col gap-4 pt-8`}>
          <View style={className`flex flex-col gap-3`}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="black" />
            </TouchableOpacity>
          </View>

          <View style={className`flex flex-col gap-4`}>
            <View style={className`flex flex-col`}>
              <Text style={className`text-[24px] font-bold`}>
                {step === 1 ? "Forgot Password" : "Reset Password"}
              </Text>
              <Text style={className`text-[#AAAAAA] text-[12px]`}>
                {step === 1
                  ? "Enter your email and we'll send you a reset code"
                  : `Enter the code sent to ${email || "your email"} and your new password`}
              </Text>
            </View>

            {step === 1 ? (
              <>
                {/* Email */}
                <View
                  style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px]
                    flex flex-row items-center p-1 gap-3`}
                >
                  <TextInput
                    placeholder="Email"
                    style={className`w-[90%] px-2`}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <TouchableOpacity
                  disabled={!email || loading}
                  onPress={handleSendCode}
                  style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]`}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={className`text-white text-[16px]`}>Send Reset Code</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Reset code */}
                <View
                  style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px]
                    flex flex-row items-center p-1 gap-3`}
                >
                  <TextInput
                    placeholder="Reset code"
                    style={className`w-[90%] px-2`}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                {/* New password */}
                <View
                  style={className`bg-[#F0F0F0] h-[46px] w-full rounded-[8px]
                    flex flex-row items-center p-1 gap-3`}
                >
                  <TextInput
                    placeholder="New password"
                    style={className`flex-1 px-2`}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    accessibilityRole="button"
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    onPress={() => setShowPassword((prev) => !prev)}
                    className='pr-1'
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color='#434343'
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  disabled={!code || !password || loading}
                  onPress={handleReset}
                  style={className`w-full h-[46px] bg-[#245AB0] flex items-center justify-center rounded-[6px]`}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={className`text-white text-[16px]`}>Reset Password</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep(1)}>
                  <Text style={className`text-[12px] text-[#007BFF] underline text-center`}>
                    Didn&apos;t get the code? Change email / resend
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Forgotpassword;

const styles = StyleSheet.create({});
