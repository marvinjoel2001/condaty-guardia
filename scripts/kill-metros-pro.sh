#!/bin/bash
# scripts/kill-metros-pro.sh
# Asegúrate de que el script tenga permisos de ejecución
# chmod +x scripts/kill-metros-pro.sh 
# Uso: ./scripts/kill-metros-pro.sh

echo "Limpieza de procesos React Native"
echo ""
echo "Selecciona qué eliminar:"
echo "1) Solo Metro bundlers (puertos 8081-8090)"
echo "2) Todos los procesos Node"
echo "3) Simuladores iOS"
echo "4) TODO (Node + Puertos + Simuladores + Cache)"
echo "5) Cancelar"
echo ""
read -p "Opción [1-5]: " option

case $option in
    1)
        echo "Liberando puertos..."
        for port in {8081..8090}; do
            lsof -ti:$port | xargs kill -9 2>/dev/null
        done
        echo "Puertos liberados"
        ;;
    2)
        echo "Matando Node..."
        killall -9 node npm npx 2>/dev/null
        echo "Procesos Node eliminados"
        ;;
    3)
        echo "Cerrando simuladores..."
        osascript -e 'tell application "Simulator" to quit' 2>/dev/null
        killall -9 Simulator 2>/dev/null
        echo "Simuladores cerrados"
        ;;
    4)
        echo "Eliminando TODO..."
        killall -9 node npm npx 2>/dev/null
        for port in {8000..9000}; do
            lsof -ti:$port | xargs kill -9 2>/dev/null
        done
        watchman shutdown-server 2>/dev/null
        osascript -e 'tell application "Simulator" to quit' 2>/dev/null
        killall -9 Simulator xcodebuild 2>/dev/null
        rm -rf $TMPDIR/metro-* $TMPDIR/haste-* 2>/dev/null
        echo "✅ TODO eliminado y limpio"
        ;;
    5)
        echo "Cancelado"
        exit 0
        ;;
    *)
        echo "Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "🎉 Listo!"