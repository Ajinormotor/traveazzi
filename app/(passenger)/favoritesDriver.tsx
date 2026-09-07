import { View, Text } from 'react-native'
import React from 'react'
import className from 'twrnc'

const FavoritesDriver = () => {
  return (
    <View style={className`flex-1 bg-white items-center justify-center p-4 gap-2`}>
      <Text style={className`text-[18px] font-bold`}>Favorite drivers</Text>
      <Text style={className`text-[14px] text-[#AAAAAA]`}>No favorite drivers yet</Text>
    </View>
  )
}

export default FavoritesDriver
