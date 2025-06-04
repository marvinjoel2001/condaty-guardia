import React, {useEffect, useState} from 'react';
import {TextInput, View, Platform, StyleSheet} from 'react-native';
// Text component was commented out in your original code and is not used here.
import Icon from './Icon/Icon'; // Assuming this is your custom Icon component
import {IconSearch, IconX} from '../../../src/icons/IconLibrary'; // Your icon sources
import {FONTS} from '../../styles/themes'; // Assuming FONTS.regular is defined in your project

// Interface for component props - msg is removed as it wasn't used in the original JSX.
interface DataSearchProps {
  setSearch: (search: string) => void;
  name?: string;
  value?: string;
  style?: object; // Use 'object' or 'ViewStyle' from 'react-native'
  iconLeft?: any; // This prop's original usage was unclear with absolute positioning.
                  // In this new layout, it's not directly used for the search icon placement,
                  // but kept in props if it serves another purpose.
  focus?: boolean;
}

const DataSearch = ({
  setSearch,
  name = '',
  value = '',
  style = {},
  focus = false,
  // iconLeft, // Not directly used in the revised layout logic for the search icon
}: DataSearchProps) => {
  // The 'active' state was not used for styling in the target design,
  // so related onFocus/onBlur logic for setActive is removed to simplify.
  // If 'active' had other purposes, this might need to be re-evaluated.
  const [searchBy, setSearchBy] = useState('');
  const [oldSearch, setOldSearch] = useState('');

  const onSearch = (v: string | false = false) => {
    let s = searchBy.trim();
    if (v !== false) {
      s = v.trim();
      setSearchBy(s);
    }
    if (s === oldSearch) return;
    setSearch(s);
    setOldSearch(s);
  };

  useEffect(() => {
    setSearchBy(value);
  }, [name]); // Kept original dependency [name] as per "no functionality change" instruction.

  return (
    <View style={[styles.container, style]}>
      {/* Conditionally render Search Icon on the left, as per original visibility logic */}
      {/* It shows if both searchBy and initial value are empty. */}
      {!searchBy && !value && (
        <Icon
          name={IconSearch}
          size={20}
          color="#a7a7a7" // Color from your target image
          style={styles.searchIcon}
        />
      )}

      <TextInput
        testID={'__searchBasic' + name}
        // id prop is not standard for React Native TextInput
        style={[
          styles.textInput,
          // If the left search icon is not visible (i.e., when text is present),
          // the text input will naturally align to the left edge of its allocated space.
          // This is typically desired.
          (!searchBy && !value) ? {} : {marginLeft: 0} // Ensures text aligns left if icon disappears
                                                        // but given container padding, it will align correctly.
                                                        // If IconSearch is visible, it has marginRight. If not, TextInput starts at container's padding.
        ]}
        autoFocus={focus}
        returnKeyType="search"
        onChangeText={(e: string) => setSearchBy(e)}
        value={searchBy}
        placeholder="Buscar..."
        placeholderTextColor="#a7a7a7" // Color from your target image
        onSubmitEditing={() => onSearch()}
        underlineColorAndroid="transparent" // Removes default underline on Android
      />

      {/* Clear Icon (X) on the right, appears if there is text, as per original logic */}
      {((searchBy && searchBy.length > 0) || (value !== '' && searchBy === value)) && (
        // This condition is based on your original: ((searchBy && searchBy) || value !== '')
        // It shows the X if there's current input OR if an initial `value` was provided.
        <Icon
          name={IconX}
          size={20}
          color="#a7a7a7" // Consistent color, can be changed if desired
          onPress={() => onSearch('')} // Action to clear search
          style={styles.clearIcon}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Align items horizontally: icon, input, icon
    alignItems: 'center', // Align items vertically centered
    backgroundColor: '#414141', // Background color from your target image
    borderRadius: 8, // Rounded corners, similar to 'rounded-lg'
    height: 48, // Fixed height, similar to 'h-12' (approx 48px)
    paddingHorizontal: 12, // Horizontal padding inside the container
    // Removed 'position: relative' as it's not needed for this flexbox layout
  },
  searchIcon: {
    marginRight: 8, // Space between the search icon and the text input (like 'gap-2')
  },
  textInput: {
    flex: 1, // Allows the TextInput to take up the available space in the middle
    height: '100%', // Fills the height of the container
    fontFamily: FONTS.regular, // Uses the font from your original theme setup
    fontSize: 14, // Font size from your target image's span
    color: '#FFFFFF', // Color of the text entered by the user (assuming white)
    // Vertical padding for text input is implicitly handled by container height and alignItemscenter.
    // No specific horizontal padding needed here as it's managed by icon margins and container padding.
  },
  clearIcon: {
    marginLeft: 8, // Space between the text input and the clear (X) icon
  },
});

export default DataSearch;