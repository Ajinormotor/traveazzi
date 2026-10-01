import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import className from 'twrnc'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'

const PassengerProfile = () => {
  const route = useRouter()
  const { user, logout } = useAuthStore()
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Not provided'
  const email = user?.email ?? 'Not provided'
  const phone = user?.phoneNumber ?? user?.phone ?? 'Not provided'
  const role = user?.roles?.[0]?.name ?? user?.role?.name ?? 'PASSENGER'

  const handleLogout = async () => {
    await logout()
    route.replace('/(auth)')
  }

  const rows = [
    { icon: 'person-outline', label: 'Full name', value: name },
    { icon: 'mail-outline', label: 'Email', value: email },
    { icon: 'call-outline', label: 'Phone', value: phone },
  ] as const

  return (
    <View style={className`flex-1 bg-[#FAFAFA]`}>
      {/* Back arrow, same icon as Manage Ride / Confirm Ride */}
      <TouchableOpacity
        accessibilityLabel="Go back"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        onPress={() => route.back()}
        style={className`absolute top-12 left-5 z-10`}
      >
        <Ionicons name="arrow-undo-circle-outline" size={20} color="#FFFFFF" />
      </TouchableOpacity>

    <ScrollView style={className`flex-1 bg-[#FAFAFA]`}>
      {/* Header card */}
      <View style={className`bg-[#245AB0] rounded-b-[30px] px-5 pt-10 pb-8 items-center gap-2`}>
        <View style={className`w-[84px] h-[84px] rounded-full bg-white/20 items-center justify-center`}>
          <Ionicons name="person" size={40} color="#FFFFFF" />
        </View>
        <Text style={className`text-white text-[22px] font-bold text-center`}>{name}</Text>
        <View style={className`bg-white/20 rounded-full px-4 py-1`}>
          <Text style={className`text-white text-[12px] font-bold tracking-widest`}>{role}</Text>
        </View>
      </View>

      {/* Info cards */}
      <View style={className`px-4 -mt-0 pt-4 gap-3 pb-6`}>
        <View style={className`bg-white rounded-[12px] border border-[#F0F0F0] px-4 py-2`}>
          {rows.map((row, i) => (
            <View
              key={row.label}
              style={className`flex flex-row items-center gap-3 py-3 ${i < rows.length - 1 ? 'border-b border-[#F5F5F5]' : ''}`}
            >
              <View style={className`w-[38px] h-[38px] rounded-full bg-[#F0F6FF] items-center justify-center`}>
                <Ionicons name={row.icon} size={18} color="#245AB0" />
              </View>
              <View style={className`flex flex-col flex-1`}>
                <Text style={className`text-[#AAAAAA] text-[12px] font-bold`}>{row.label}</Text>
                <Text style={className`text-black text-[15px] font-bold`}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={className`bg-white rounded-[12px] border border-[#FEE2E2] px-4 py-4 flex flex-row items-center justify-center gap-2`}
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={className`text-[#DC2626] text-[15px] font-bold`}>Log out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </View>
  )
}

export default PassengerProfile
