import React from 'react'
import { StyleSheet } from 'react-native'
import MapSheetScreen from '@/components/MapSheetScreen'
import bg from "../../assets/images/map_bg.png"
import Search from '@/components/Search'

const Index = () => {
  return (
    <MapSheetScreen
      mode="view"
      fallback={bg}
      initialRatio={0.5}
      minRatio={0.18}
      maxRatio={0.92}
      showMarker
      showLocateButton
      sheetBackgroundColor="#FFFFFF"
      sheetContentStyle={styles.sheetBody}
    >
      <Search />
    </MapSheetScreen>
  )
}

export default Index

const styles = StyleSheet.create({
  sheetBody: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
})
