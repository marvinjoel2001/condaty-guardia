#!/bin/bash
# scripts/kill-android.sh
# Asegúrate de que el script tenga permisos de ejecución
# chmod +x scripts/kill-android.sh 
# Uso: ./scripts/kill-android.sh

echo "Matando todos los procesos de Android..."

# Matar procesos de node/metro
echo "Matando procesos de Node/Metro..."
killall -9 node npm npx 2>/dev/null && echo "Procesos de Node eliminados"

# Matar emuladores
echo "Cerrando emuladores..."
adb devices | grep emulator | cut -f1 | while read line; do
    adb -s $line emu kill 2>/dev/null
done
killall -9 qemu-system-x86_64 2>/dev/null
killall -9 emulator 2>/dev/null
echo "Emuladores cerrados"

# Liberar puertos
for port in {8092..8100..2}; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        kill -9 $pid 2>/dev/null
        echo "Puerto $port liberado"
    fi
done

# Matar adb server
echo "Reiniciando ADB..."
adb kill-server 2>/dev/null
adb start-server 2>/dev/null
echo "ADB reiniciado"

# Limpiar cache de gradle (opcional)
# echo "⚡ Limpiando cache de Gradle..."
# rm -rf ~/.gradle/caches/
# cd android && ./gradlew clean 2>/dev/null

echo ""
echo "¡Todo limpio! Puedes reiniciar tus emuladores."