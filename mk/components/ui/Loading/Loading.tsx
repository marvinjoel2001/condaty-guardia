import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { FONTS, cssVar } from '../../../styles/themes'

interface LoadingProps {
    label?: boolean
    color?: string
}

const Loading = ({label,color}:LoadingProps) => {
  return (
    <View style={styles.loading}>
   {label && <Text style={styles.loadingTitle}>Cargando....</Text>}
    <ActivityIndicator color={color || cssVar.cAccent} />
  </View>
  )
}

export default Loading;

const styles = StyleSheet.create({
    loading: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        marginVertical:cssVar.spL,
        alignSelf:'center'
      },
      loadingTitle: {
        color: cssVar.cWhite,
        fontSize: cssVar.sM,
        fontFamily: FONTS.semiBold,
      },
})