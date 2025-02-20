import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {cssVar, TypeStyles} from '../../../styles/themes';

interface Tab {
  value: string;
  text: string;
  notificationCount?: number;
}

interface TabsButtonsProps {
  tabs: Tab[];
  selected: string;
  onSelect: (value: string | null) => void;
  allowDeselect?: boolean;
  style?: TypeStyles;
}

const TabsButtons = ({
  tabs,
  selected,
  onSelect,
  allowDeselect = false,
  style,
}: TabsButtonsProps) => {
  const [selectedTab, setSelectedTab] = useState<string | null>(selected);

  useEffect(() => {
    setSelectedTab(selected);
  }, [selected]);

  const handleTabPress = (value: string) => {
    if (allowDeselect && selectedTab === value) {
      setSelectedTab(null);
      onSelect(null);
    } else {
      setSelectedTab(value);
      onSelect(value);
    }
  };

  return (
    <View style={{...styles.container, ...style}}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.value}
            style={[
              styles.tab,
              selectedTab === tab.value ? styles.selectedTab : {},
            ]}
            onPress={() => handleTabPress(tab.value)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.value ? styles.selectedTabText : {},
              ]}>
              {tab.text}
            </Text>
            {tab.notificationCount ? (
              <View style={styles.notificationBubble}>
                <Text style={styles.notificationText}>
                  {tab.notificationCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginBottom: cssVar.spM,
    marginTop: cssVar.spM,
  },
  tab: {
    marginHorizontal: cssVar.spXs,
    paddingHorizontal: cssVar.spL,
    paddingVertical: cssVar.spS,
    borderRadius: cssVar.bRadiusL,
    backgroundColor: cssVar.cHover,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTab: {
    backgroundColor: '#39ACEC33',
  },
  tabText: {
    color: cssVar.cBlackV2,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTabText: {
    color: cssVar.cInfo,
    fontWeight: 'bold',
  },
  notificationBubble: {
    marginLeft: 6,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export type {TabsButtonsProps};
export default TabsButtons;
