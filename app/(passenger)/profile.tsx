import { View, Text } from 'react-native'
import React from 'react'
import className from 'twrnc'
import { useAuthStore } from '@/store/authStore'

const PassengerProfile = () => {
  const { user } = useAuthStore()
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Not provided'
  const email = user?.email ?? 'Not provided'
  const phone = user?.phoneNumber ?? user?.phone ?? 'Not provided'
  const role = user?.roles?.[0]?.name ?? user?.role?.name ?? 'PASSENGER'

  return (
    <View style={className`flex-1 bg-white p-4 gap-3`}>
      <Text style={className`text-[20px] font-bold`}>Profile</Text>
      <View style={className`flex flex-col gap-2`}>
        <Text style={className`text-[14px]`}>Name: {name}</Text>
        <Text style={className`text-[14px]`}>Email: {email}</Text>
        <Text style={className`text-[14px]`}>Phone: {phone}</Text>
        <Text style={className`text-[14px]`}>Role: {role}</Text>
      </View>
    </View>
  )
}

export default PassengerProfile
