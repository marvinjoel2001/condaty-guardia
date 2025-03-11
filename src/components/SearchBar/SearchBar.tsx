import React, { useContext } from "react";
import { TouchableOpacity, View } from "react-native";
import DataSearch from "../../../mk/components/ui/DataSearch";
import { IconDownload } from "../../icons/IconLibrary";
import { cssVar } from "../../../mk/styles/themes";
import Icon from "../../../mk/components/ui/Icon/Icon";


const SearchBar = ({ onSearch, search, name, setOpenDropdown }: any) => {
  // const { theme } = useContext(ThemeContext);
  return (
    <View
      style={{
        width: "100%",
        gap: 8,
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexGrow: 1 }}>
        <DataSearch setSearch={onSearch} name={name} value={search} />
      </View>
      <TouchableOpacity
        onPress={() => setOpenDropdown()}
        accessibilityLabel={"Exportar datos " + name}
        style={{
          padding: 12,
        }}
      >
        <Icon
          name={ IconDownload }
          fillStroke={cssVar.cWhite}
          size={24}
          style={{ justifyContent: "center" }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
