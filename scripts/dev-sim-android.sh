#!/bin/bash

# scripts/dev-multi-android.sh

# Trap para limpiar procesos al salir
cleanup() {
    echo "\n Deteniendo todos los procesos..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup INT TERM

echo "Iniciando múltiples emuladores Android..."
echo "Presiona Ctrl+C para detener todo"
echo ""

# Limpiar puertos primero
lsof -ti:8081 | xargs kill -9 2>/dev/null
lsof -ti:8082 | xargs kill -9 2>/dev/null

# Listar emuladores disponibles
echo "📱 Emuladores disponibles:"
emulator -list-avds
echo ""

# Metro bundlers
echo "📦 Iniciando Metro en puerto 8081..."
npx react-native start --port 8081 > /dev/null 2>&1 &

echo "📦 Iniciando Metro en puerto 8082..."
npx react-native start --port 8082 > /dev/null 2>&1 &

# Esperar a que metros estén listos
sleep 5

# Emulador 1 (cambia el nombre por el tuyo)
echo "Iniciando emulador 1..."
emulator -avd Pixel_5_API_33 &
sleep 10

echo "🚀 Instalando app en emulador 1..."
npx react-native run-android --port 8081 &

sleep 5

# Emulador 2 (cambia el nombre por el tuyo)
echo "Iniciando emulador 2..."
emulator -avd Pixel_6_API_34 &
sleep 10

echo "Instalando app en emulador 2..."
npx react-native run-android --port 8082 &

echo ""
echo "¡Emuladores iniciados!"
echo "Metro: http://localhost:8081 y http://localhost:8082"
echo ""
echo "Tip: Usa 'adb devices' para ver dispositivos conectados"

# Mantener corriendo
wait