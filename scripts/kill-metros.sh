#!/bin/bash
# scripts/kill-metros.sh
# Asegúrate de que el script tenga permisos de ejecución
# chmod +x scripts/kill-metros.sh 
# Uso: ./scripts/kill-metros.sh

echo "Matando todos los procesos de Metro y React Native..."

# Matar todos los procesos de node (Metro bundler)
echo "Matando procesos de Node/Metro..."
killall -9 node 2>/dev/null && echo "Procesos de Node eliminados" || echo "No hay procesos de Node corriendo"

# Matar procesos en puertos comunes (8081-8090)
echo "Liberando puertos..."
for port in {8081..8100}; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        kill -9 $pid 2>/dev/null
        echo "Puerto $port liberado"
    fi
done

# Matar watchman (si está instalado)
if command -v watchman &> /dev/null; then
    echo "Deteniendo Watchman..."
    watchman shutdown-server 2>/dev/null && echo "Watchman detenido"
fi

# Matar simuladores de iOS (opcional)
echo "Cerrando simuladores de iOS..."
osascript -e 'tell application "Simulator" to quit' 2>/dev/null && echo "Simuladores cerrados" || echo "No hay simuladores corriendo"

echo ""
echo "¡Todo limpio! Puedes reiniciar tus simuladores."