#!/bin/bash

# scripts/dev-sim-ios.sh
# Asegúrate de que el script tenga permisos de ejecución
# chmod +x scripts/dev-sim-ios.sh 
# Uso: ./scripts/dev-sim-ios.sh

# Colores para mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Trap para limpiar procesos al salir
cleanup() {
  echo -e "\n${RED} Deteniendo todos los procesos...${NC}"
  kill $(jobs -p) 2>/dev/null
  exit
}

trap cleanup INT TERM

# Configuración de simuladores (puertos IMPARES desde 8093)
declare -A SIMULATORS
SIMULATORS[1]="iPhone 13 mini:8093"
SIMULATORS[2]="iPhone 15:8095"
SIMULATORS[3]="iPhone 16 Pro:8097"
SIMULATORS[4]="iPad Air 11-inch (M3):8099"

# Función para listar simuladores disponibles en el sistema
list_available_sims() {
    echo -e "${BLUE} Simuladores iOS disponibles en tu sistema:${NC}"
    xcrun simctl list devices available | grep -i "iphone\|ipad"
    echo ""
}

# Función para validar si un simulador existe
check_simulator_exists() {
    local sim_name=$1
    if xcrun simctl list devices | grep -q "$sim_name"; then
      return 0
    else
      return 1
    fi
}

# Función para iniciar un simulador
start_simulator() {
    local sim_number=$1
    local sim_config="${SIMULATORS[$sim_number]}"
    
    if [ -z "$sim_config" ]; then
      echo -e "${RED} Simulador no válido${NC}"
      return 1
    fi
    
    local sim_name="${sim_config%:*}"
    local port="${sim_config#*:}"
    
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════${NC}"
    echo -e "${GREEN} Simulador: ${sim_name}${NC}"
    echo -e "${GREEN} Puerto Metro: ${port}${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════${NC}"
    
    # Verificar si el simulador existe
    if ! check_simulator_exists "$sim_name"; then
      echo -e "${YELLOW}  Advertencia: El simulador '${sim_name}' no existe en tu sistema${NC}"
      echo -e "${YELLOW} Mostrando simuladores disponibles...${NC}"
      echo ""
      list_available_sims
      read -p "¿Deseas continuar de todas formas? (s/n): " confirm
      if [[ ! $confirm =~ ^[sS]$ ]]; then
        echo -e "${RED} Cancelado${NC}"
        return 1
      fi
    fi
    
    # Limpiar puerto si está ocupado
    echo -e "${YELLOW}🧹 Limpiando puerto ${port}...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null
    
    echo -e "${GREEN} Iniciando Metro en puerto ${port}...${NC}"
    npx react-native start --port $port > /dev/null 2>&1 &
    local metro_pid=$!
    
    sleep 3
    
    echo -e "${GREEN} Lanzando app en ${sim_name}...${NC}"
    npx react-native run-ios --simulator="$sim_name" --port $port
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN} ${sim_name} iniciado correctamente en puerto ${port}${NC}"
    else
      echo -e "${RED} Error al iniciar ${sim_name}${NC}"
      kill $metro_pid 2>/dev/null
      return 1
    fi
}

# Función para iniciar múltiples simuladores
start_multiple() {
    echo -e "${BLUE} Simuladores iOS configurados:${NC}"
    echo ""
    
    for key in $(echo ${!SIMULATORS[@]} | tr ' ' '\n' | sort -n); do
      local config="${SIMULATORS[$key]}"
      local name="${config%:*}"
      local port="${config#*:}"
      echo "$key) $name (Puerto $port)"
    done
    
    echo ""
    echo -e "${YELLOW} Puedes seleccionar múltiples simuladores (ej: 1 3 o solo 2)${NC}"
    echo -e "${YELLOW} Presiona Enter sin seleccionar nada para cancelar${NC}"
    echo ""
    read -p "Selecciona los números de simuladores a iniciar (separados por espacio): " -a selections
    
    if [ ${#selections[@]} -eq 0 ]; then
      echo -e "${RED} Cancelado${NC}"
      return 0
    fi
    
    # Validar selecciones
    local valid_selections=()
    for sel in "${selections[@]}"; do
      if [[ "$sel" =~ ^[1-4]$ ]]; then
        valid_selections+=("$sel")
      else
        echo -e "${RED} Ignorando selección inválida: $sel${NC}"
      fi
    done
    
    if [ ${#valid_selections[@]} -eq 0 ]; then
      echo -e "${RED} No hay selecciones válidas${NC}"
      return 1
    fi
    
    # Iniciar simuladores seleccionados
    for sim_num in "${valid_selections[@]}"; do
      start_simulator $sim_num &
      sleep 5  # Esperar entre simuladores para no sobrecargar
    done
    
    echo ""
    echo -e "${GREEN} Todos los simuladores seleccionados han sido iniciados!${NC}"
    echo -e "${YELLOW}Presiona Ctrl+C para detener todo${NC}"
    
    wait
}

# Menú principal
show_menu() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║      📱 iOS Simulator Manager         ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW} Puertos: Solo IMPARES desde 8093 (8093, 8095, 8097...)${NC}"
    echo ""
    echo "1) Elegir simuladores a iniciar"
    echo "2) Listar simuladores disponibles en el sistema"
    echo "3) Ver simuladores configurados"
    echo "4) Salir"
    echo ""
    read -p "Selecciona una opción [1-5]: " option
    
    case $option in
      1)
        start_multiple
        ;;
      2)
        list_available_sims
        show_menu
        ;;
      3)
        echo ""
        echo -e "${BLUE}📱 Simuladores configurados:${NC}"
        for key in $(echo ${!SIMULATORS[@]} | tr ' ' '\n' | sort -n); do
            local config="${SIMULATORS[$key]}"
            local name="${config%:*}"
            local port="${config#*:}"
            echo -e "${GREEN}$key)${NC} $name ${YELLOW}(Puerto $port)${NC}"
        done
        echo ""
        show_menu
        ;;
      4)
        echo -e "${GREEN} ¡Adiós!${NC}"
        exit 0
        ;;
      *)
        echo -e "${RED} Opción inválida${NC}"
        show_menu
        ;;
    esac
}

# Manejo de argumentos
if [ $# -eq 0 ]; then
  show_menu
else
  case $1 in
    sim1|1)
      start_simulator 1
      ;;
    sim2|2)
      start_simulator 2
      ;;
    sim3|3)
      start_simulator 3
      ;;
    sim4|4)
      start_simulator 4
      ;;
    list)
      list_available_sims
      ;;
    menu)
      show_menu
      ;;
    *)
      echo -e "${RED} Opción no válida: $1${NC}"
      echo ""
      echo "Uso: ./scripts/dev-sim-ios.sh [1-4|sim1-sim4|list|quick|menu]"
      echo ""
      echo "Opciones:"
      echo "  1 o sim1  - iPhone 13 mini (Puerto 8093)"
      echo "  2 o sim2  - iPhone 15 (Puerto 8095)"
      echo "  3 o sim3  - iPhone 16 Pro (Puerto 8097)"
      echo "  4 o sim4  - iPad Air 11-inch (M3) (Puerto 8099)"
      echo "  list      - Listar simuladores disponibles"
      echo "  menu      - Mostrar menú interactivo"
      echo "  (vacío)   - Mostrar menú interactivo"
      exit 1
      ;;
  esac
fi