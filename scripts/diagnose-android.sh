#!/bin/bash

echo " Diagnóstico Android SDK"
echo "=========================="
echo ""

echo " ANDROID_HOME:"
if [ -z "$ANDROID_HOME" ]; then
    echo "  No configurado"
else
    echo " $ANDROID_HOME"
fi
echo ""

echo " Buscando instalación de Android SDK:"
find ~ -name "platform-tools" -type d 2>/dev/null | head -5
echo ""

echo "🔧 Verificando comandos:"
echo -n "   adb: "
if command -v adb &> /dev/null; then
    echo " $(which adb)"
else
    echo " No encontrado"
fi

echo -n "   emulator: "
if command -v emulator &> /dev/null; then
    echo " $(which emulator)"
else
    echo " No encontrado"
fi
echo ""

echo "📱 Emuladores disponibles:"
if command -v emulator &> /dev/null; then
    emulator -list-avds 2>/dev/null | nl -w2 -s') ' || echo "  No se pueden listar"
else
    echo " Comando emulator no disponible"
fi
echo ""

echo "🔌 Dispositivos conectados:"
if command -v adb &> /dev/null; then
    adb devices -l 2>/dev/null || echo "  No se pueden listar"
else
    echo " Comando adb no disponible"
fi
echo ""

echo " Recomendaciones:"
if [ -z "$ANDROID_HOME" ]; then
    echo "   1. Configura ANDROID_HOME en tu ~/.zshrc o ~/.bashrc"
    echo "   2. Añade al PATH: \$ANDROID_HOME/emulator y \$ANDROID_HOME/platform-tools"
    echo "   3. Ejecuta: source ~/.zshrc"
fi

if ! command -v emulator &> /dev/null; then
    echo "   4. Instala Android SDK desde Android Studio"
    echo "   5. Ve a Settings → SDK Manager → SDK Tools"
fi