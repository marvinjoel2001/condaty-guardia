import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';

type PropsType = {
  items: any;
  onSelect: any;
  isVisible: boolean;
  setIsVisible: any;
};

const Dropdown = ({items, onSelect, isVisible, setIsVisible}: PropsType) => {
  const [selectedItem, setSelectedItem]: any = useState(null);
  const [dropdownHeight] = useState(new Animated.Value(0)); // Controla la altura del dropdown

  // Animación de despliegue (expandir)
  useEffect(() => {
    if (isVisible) {
      Animated.timing(dropdownHeight, {
        toValue: Platform.OS === 'ios' ? 90 : 100, // Altura final del dropdown
        duration: 300, // Duración de la animación
        useNativeDriver: false, // No se puede usar el driver nativo para la altura
      }).start();
    } else {
      Animated.timing(dropdownHeight, {
        toValue: 0, // Altura inicial (colapsado)
        duration: 300, // Duración de la animación
        useNativeDriver: false, // No se puede usar el driver nativo para la altura
      }).start();
    }
  }, [isVisible]);

  const handleSelect = (item: any) => {
    setSelectedItem(item);
    setIsVisible(false); // Cierra el Dropdown cuando se selecciona un item
    onSelect(item); // Notifica al componente padre
  };

  const handleOutsidePress = () => {
    setIsVisible(false); // Cierra el Dropdown si se hace clic fuera del contenido
  };

  return (
    <Modal visible={isVisible} transparent animationType="none">
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={handleOutsidePress}>
        <View style={styles.modalContent}>
          <Animated.View
            style={[
              styles.dropdownList,
              {
                height: dropdownHeight, // Aplicamos la animación de altura
              },
            ]}>
            <FlatList
              data={items}
              keyExtractor={item => item.value.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelect(item)}>
                  <Text>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingTop:
      Platform.OS === 'ios'
        ? Dimensions.get('window').height < 700
          ? 60
          : 100
        : 40,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingRight: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    borderWidth: 1,
    borderColor: '#393C3F',
    backgroundColor: '#212529',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    width: 200,
    overflow: 'hidden', // Asegura que los elementos no sobresalgan durante la animación
  },
  dropdownList: {
    overflow: 'hidden', // Asegura que los elementos no sobresalgan durante la animación
  },
  item: {
    padding: 12,
  },
});

export default Dropdown;
