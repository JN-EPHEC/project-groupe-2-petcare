import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Special styling for location pin (4th button - ProfileTab)
          if (route.name === 'ProfileTab') {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.locationPinContainer}
              >
                <View style={styles.locationPin}>
                  <FontAwesome name="user" size={36} color={colors.white} />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
            >
              <View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
                {route.name === 'HomeTab' && (
                  <Ionicons name="home" size={32} color={colors.black} />
                )}
                {route.name === 'AddTab' && (
                  <Ionicons name="add" size={36} color={colors.black} />
                )}
                {route.name === 'SearchTab' && (
                  <Ionicons name="search" size={32} color={colors.black} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.teal,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.teal,
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerFocused: {
    // Add focus styling if needed
  },
  
  // Location Pin (4th icon - elevated)
  locationPinContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -50,
    flex: 1,
  },
  locationPin: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

