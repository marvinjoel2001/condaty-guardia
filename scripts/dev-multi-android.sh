#!/bin/bash

# scripts/dev-multi-android.sh


# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

cleanup() {
    echo -e "\n${RED} Deteniendo todos los procesos...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup INT TERM

# Configuración
EMULATOR_PATH="/Users/elvismilan/Library/Android/sdk/emulator/emulator"

declare -A EMULATORS
EMULATORS[1]="Small_Phone_API_33:8092"
EMULATORS[2]="Pixel_8_Pro_API_36:8094"
EMULATORS[3]="Medium_Tablet_API_33:8096"

# Función para esperar dispositivo (MEJORADA)
wait_for_device_improved() {
    local device_id=$1
    local emu_name=$2
    local max_wait=180  # 3 minutos
    local elapsed=0
    
    echo -e "${YELLOW} Esperando que el emulador se inicie...${NC}"
    echo -e "${YELLOW} Esto puede tomar hasta 3 minutos${NC}"
    
    adb start-server >/dev/null 2>&1

    while [ $elapsed -lt $max_wait ]; do
        local devices_output=$(adb devices 2>/dev/null | tr -d '\r')
        if echo "$devices_output" | awk '{print $1, $2}' | grep -q "$device_id device"; then
            echo -e "${GREEN} Emulador detectado: $device_id${NC}"
            
            # Verificar boot completado
            echo -e "${YELLOW} Esperando que el sistema termine de arrancar...${NC}"
            local boot_wait=0
            while [ $boot_wait -lt 60 ]; do
                local boot_prop=$(adb -s "$device_id" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r\n')
                if [ "$boot_prop" = "1" ]; then
                    echo -e "${GREEN} Boot completado en ${boot_wait}s${NC}"
                    sleep 3
                    return 0
                fi
                sleep 2
                ((boot_wait+=2))
            done
            
            echo -e "${YELLOW} Conectado pero el boot no se confirmó; continuando...${NC}"
            return 0
        fi

        # Mostrar progreso
        if [ $((elapsed % 15)) -eq 0 ]; then
            echo -e "${YELLOW} Esperando ADB (${elapsed}/${max_wait}s)...${NC}"
        fi
        
        sleep 3
        ((elapsed+=3))
    done
    
    echo -e "${RED} Timeout: el emulador no fue detectado en ${max_wait}s${NC}"
    adb devices
    return 1
}


# Función para iniciar emulador (MEJORADA)
start_emulator() {
    local emu_number=$1
    local emu_config="${EMULATORS[$emu_number]}"
    
    if [ -z "$emu_config" ]; then
        echo -e "${RED} Emulador no válido${NC}"
        return 1
    fi
    
    local emu_name="${emu_config%:*}"
    local port="${emu_config#*:}"
    local device_port=$((5554 + (emu_number - 1) * 2))
    local device_id="emulator-$device_port"
    
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════${NC}"
    echo -e "${GREEN} Emulador: ${emu_name}${NC}"
    echo -e "${GREEN} Puerto Metro: ${port}${NC}"
    echo -e "${GREEN} Device ID: ${device_id}${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════${NC}"
    
    # Verificar si ya existe un emulador corriendo en ese puerto
    if adb devices 2>/dev/null | grep -q "$device_id"; then
        echo -e "${YELLOW} Ya existe un emulador en $device_id${NC}"
        read -p "¿Deseas cerrar el existente y continuar? (s/n): " confirm
        if [[ $confirm =~ ^[sS]$ ]]; then
            adb -s $device_id emu kill 2>/dev/null
            sleep 3
        else
            echo -e "${RED} Cancelado${NC}"
            return 1
        fi
    fi
    
    # Limpiar puerto Metro
    echo -e "${YELLOW} Limpiando puerto ${port}...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null
    
    # Iniciar Metro
    echo -e "${GREEN} Iniciando Metro Bundler en puerto ${port}...${NC}"
    npx react-native start --port $port > /tmp/metro-${port}.log 2>&1 &
    local metro_pid=$!
    echo -e "${GREEN}   PID Metro: $metro_pid${NC}"
    
    sleep 4
    
    # Verificar que Metro esté corriendo
    if ! kill -0 $metro_pid 2>/dev/null; then
        echo -e "${RED} Metro bundler falló al iniciar${NC}"
        cat /tmp/metro-${port}.log
        return 1
    fi
    
    # Lanzar emulador
    echo -e "${GREEN} Lanzando emulador...${NC}"
    echo -e "${YELLOW}   Comando: $EMULATOR_PATH -avd $emu_name${NC}"
    
    "$EMULATOR_PATH" -avd "$emu_name" -netdelay none -netspeed full > /tmp/emulator-${emu_number}.log 2>&1 &
    local emu_pid=$!
    echo -e "${GREEN} PID Emulador: $emu_pid${NC}"
    
    sleep 8
    
    # Verificar que el proceso del emulador siga vivo
    if ! kill -0 $emu_pid 2>/dev/null; then
        echo -e "${RED} El emulador terminó inesperadamente${NC}"
        echo -e "${YELLOW}Log del emulador:${NC}"
        cat /tmp/emulator-${emu_number}.log | tail -20
        kill $metro_pid 2>/dev/null
        return 1
    fi
    
    # Esperar a que ADB detecte el dispositivo
    if ! wait_for_device_improved "$device_id" "$emu_name"; then
        echo -e "${RED} El emulador no se detectó${NC}"
        echo ""
        echo -e "${YELLOW}Estado actual de ADB:${NC}"
        adb devices -l
        echo ""
        echo -e "${YELLOW}Log del emulador (últimas 20 líneas):${NC}"
        cat /tmp/emulator-${emu_number}.log | tail -20
        kill $metro_pid 2>/dev/null
        kill $emu_pid 2>/dev/null
        return 1
    fi
    
    # Verificación final
    echo -e "${YELLOW}🔍 Verificación final de conexión...${NC}"
    sleep 2
    
    if ! adb devices 2>/dev/null | grep "$device_id" | grep -q "device"; then
        echo -e "${RED} El dispositivo no está listo para instalación${NC}"
        adb devices -l
        kill $metro_pid 2>/dev/null
        return 1
    fi
    
    # Instalar app
    echo -e "${GREEN} Instalando app React Native...${NC}"
    echo -e "${YELLOW}   Puerto: $port, Device: $device_id${NC}"
    
    if npx react-native run-android --port $port --deviceId "$device_id"; then
        echo ""
        echo -e "${GREEN} ${emu_name} iniciado exitosamente!${NC}"
        echo -e "${GREEN} Puerto Metro: $port${NC}"
        echo -e "${GREEN} Device ID: $device_id${NC}"
        return 0
    else
        echo -e "${RED} Error instalando la app${NC}"
        echo ""
        echo -e "${YELLOW} Intenta manualmente:${NC}"
        echo -e "${YELLOW}   npx react-native run-android --port $port --deviceId $device_id${NC}"
        kill $metro_pid 2>/dev/null
        return 1
    fi
}

# Función para iniciar múltiples
start_multiple() {
    echo -e "${BLUE}📱 Emuladores configurados:${NC}"
    echo ""
    
    for key in 1 2 3; do
        local config="${EMULATORS[$key]}"
        local name="${config%:*}"
        local port="${config#*:}"
        echo -e "${GREEN}$key) $name (Puerto $port)${NC}"
    done
    
    echo ""
    echo -e "${YELLOW} Selecciona múltiples (ej: 1 2) o solo uno${NC}"
    echo -e "${YELLOW} Enter vacío para cancelar${NC}"
    echo ""
    read -p "Números de emuladores [1-3]: " -a selections
    
    if [ ${#selections[@]} -eq 0 ]; then
        echo -e "${RED} Cancelado${NC}"
        return 0
    fi
    
    # Validar y filtrar
    local valid=()
    for sel in "${selections[@]}"; do
        if [[ "$sel" =~ ^[1-3]$ ]]; then
            valid+=("$sel")
        else
            echo -e "${RED} Ignorando: $sel${NC}"
        fi
    done
    
    if [ ${#valid[@]} -eq 0 ]; then
        echo -e "${RED} Sin selecciones válidas${NC}"
        return 1
    fi
    
    # Limpiar puertos
    echo -e "${YELLOW}🧹 Limpiando puertos...${NC}"
    for port in {8092..8100..2}; do
        lsof -ti:$port | xargs kill -9 2>/dev/null
    done
    
    # Reiniciar ADB
    echo -e "${YELLOW} Reiniciando ADB...${NC}"
    adb kill-server >/dev/null 2>&1
    sleep 2
    adb start-server >/dev/null 2>&1
    sleep 2
    
    # Iniciar cada emulador
    for idx in "${!valid[@]}"; do
        local emu_num="${valid[$idx]}"
        
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}   Iniciando emulador $((idx+1)) de ${#valid[@]}${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        start_emulator $emu_num
        
        # Pausa entre emuladores
        if [ $idx -lt $((${#valid[@]} - 1)) ]; then
            echo ""
            echo -e "${YELLOW} Pausa de 20 segundos antes del siguiente...${NC}"
            sleep 20
        fi
    done
    
    echo ""
    echo -e "${GREEN} Proceso completado!${NC}"
    echo -e "${YELLOW}Presiona Ctrl+C para detener todo${NC}"
    wait
}

# Menú
show_menu() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   🤖 Android Multi-Emulator Manager   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "1) Elegir emuladores a iniciar"
    echo "2) Iniciar Small Phone (8092)"
    echo "3) Iniciar Pixel 8 Pro (8094)"
    echo "4) Iniciar Tablet (8096)"
    echo "5) Ver dispositivos conectados"
    echo "6) Reiniciar ADB"
    echo "7) Salir"
    echo ""
    read -p "Opción [1-7]: " option
    
    case $option in
        1) start_multiple ;;
        2) 
            adb kill-server && adb start-server
            sleep 2
            start_emulator 1
            wait
            ;;
        3)
            adb kill-server && adb start-server
            sleep 2
            start_emulator 2
            wait
            ;;
        4)
            adb kill-server && adb start-server
            sleep 2
            start_emulator 3
            wait
            ;;
        5)
            echo ""
            adb devices -l
            echo ""
            show_menu
            ;;
        6)
            echo -e "${YELLOW} Reiniciando ADB...${NC}"
            adb kill-server && adb start-server
            echo -e "${GREEN} Listo${NC}"
            show_menu
            ;;
        7)
            echo -e "${GREEN} Adiós!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED} Inválido${NC}"
            show_menu
            ;;
    esac
}

# Main
if [ $# -eq 0 ]; then
    show_menu
else
    case $1 in
        1) adb kill-server && adb start-server && sleep 2 && start_emulator 1 ;;
        2) adb kill-server && adb start-server && sleep 2 && start_emulator 2 ;;
        3) adb kill-server && adb start-server && sleep 2 && start_emulator 3 ;;
        *) echo "Uso: $0 [1|2|3]" ;;
    esac
fi