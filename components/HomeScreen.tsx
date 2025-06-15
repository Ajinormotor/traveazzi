import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import className  from 'twrnc'

const HomeScreen = () => {
  return (
    <View style={className`flex-1 p-3`}>

        <Stack.Screen 
options={{}}
        />
      <Text>HomeSCreen</Text>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({})