import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'

const SafeScreen = ({ children} : any) => {
    const insets = useSafeAreaInsets()
  return (
    <View style={[styles.container, {paddingTop: insets.top,
      paddingBottom: insets.bottom 
    } ]}>
     {children}
    </View>
  )
}

export default SafeScreen

const styles = StyleSheet.create({
    container:{
    flex: 1,
    backgroundColor:  Colors.light.background
    }
})