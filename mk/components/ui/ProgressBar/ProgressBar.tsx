import React from 'react';
import {View, StyleSheet} from 'react-native';

type ProgressBarProps = {
  progress: number; // Valor de progreso entre 0 y 1
  height?: number; // Altura de la barra de progreso
  backgroundColor?: string; // Color del fondo
  progressColor?: string; // Color de la barra de progreso
  borderRadius?: number; // Radio de los bordes de la barra
};

const ProgressBar = ({
  progress = 0,
  height = 10,
  backgroundColor = '#e0e0e0', // Color de fondo (gris claro por defecto)
  progressColor = '#3b82f6', // Color de la barra de progreso (azul por defecto)
  borderRadius = 5, // Radio por defecto
}: ProgressBarProps) => {
  return (
    <View style={[styles.container, {height, backgroundColor, borderRadius}]}>
      <View
        style={[
          styles.progress,
          {
            width: `${progress * 100}%`, // Calcula el porcentaje
            backgroundColor: progressColor,
            borderRadius,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', // Ancho completo
    backgroundColor: '#e0e0e0', // Color de fondo
    overflow: 'hidden', // Asegura que los bordes sean redondeados
    marginTop: 8,
  },
  progress: {
    height: '100%', // La barra llena toma toda la altura del contenedor
  },
});

export default ProgressBar;
