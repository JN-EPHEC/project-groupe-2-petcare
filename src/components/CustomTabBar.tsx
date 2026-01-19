import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';
import { useAuth } from '../context/AuthContext';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { user } = useAuth();
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            // Bouton Premium (AddTab) - redirection spéciale UNIQUEMENT pour les propriétaires
            if (route.name === 'AddTab' && user?.role === 'owner') {
              navigation.navigate('ProfileTab', { screen: 'Premium' });
              return;
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Bouton Premium central (flottant doré) - UNIQUEMENT pour les propriétaires
          if (route.name === 'AddTab' && user?.role === 'owner') {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.premiumButtonContainer}
                activeOpacity={0.8}
              >
                <View style={styles.premiumButton}>
                  <Ionicons name="star" size={32} color={colors.white} />
                  <Text style={styles.premiumButtonText}>Premium</Text>
                </View>
              </TouchableOpacity>
            );
          }

          // Bouton Rendez-vous pour vétérinaires (AddTab)
          if (route.name === 'AddTab' && user?.role === 'vet') {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
                  <Ionicons 
                    name={isFocused ? "calendar" : "calendar-outline"} 
                    size={28} 
                    color={isFocused ? colors.white : 'rgba(255,255,255,0.6)'} 
                  />
                </View>
                {isFocused && <View style={styles.focusIndicatorSmall} />}
              </TouchableOpacity>
            );
          }

          // Bouton Profile (user elevé)
          if (route.name === 'ProfileTab') {
            const onProfilePress = () => {
              // Toujours naviguer vers le profil du propriétaire, pas celui de l'animal
              navigation.navigate('ProfileTab', { screen: 'OwnerProfile' });
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onProfilePress}
                style={styles.profileButtonContainer}
                activeOpacity={0.8}
              >
                <View style={[styles.profileButton, isFocused && styles.profileButtonFocused]}>
                  <FontAwesome name="user" size={28} color={isFocused ? colors.teal : colors.white} />
                </View>
                {isFocused && <View style={styles.focusIndicator} />}
              </TouchableOpacity>
            );
          }

          // Boutons normaux (Home et Search)
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
                {route.name === 'HomeTab' && (
                  <Ionicons 
                    name={isFocused ? "home" : "home-outline"} 
                    size={28} 
                    color={isFocused ? colors.white : 'rgba(255,255,255,0.6)'} 
                  />
                )}
                {route.name === 'SearchTab' && (
                  <Ionicons 
                    name={isFocused ? "search" : "search-outline"} 
                    size={28} 
                    color={isFocused ? colors.white : 'rgba(255,255,255,0.6)'} 
                  />
                )}
              </View>
              {isFocused && <View style={styles.focusIndicatorSmall} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    ...(Platform.OS === 'web' ? {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    } : {}),
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.navy,
    height: 75,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    paddingTop: spacing.xs,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  iconContainerFocused: {
    transform: [{ scale: 1.1 }],
  },
  focusIndicatorSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white,
    marginTop: 4,
  },
  
  // Bouton Premium central (doré flottant)
  premiumButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
    flex: 1,
  },
  premiumButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFB300',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB300',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 4,
    borderColor: colors.white,
  },
  premiumButtonText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginTop: 2,
  },
  
  // Bouton Profile (user elevé)
  profileButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -35,
    flex: 1,
  },
  profileButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    borderWidth: 4,
    borderColor: colors.teal,
  },
  profileButtonFocused: {
    backgroundColor: colors.white,
    borderColor: colors.teal,
    shadowColor: colors.teal,
    shadowOpacity: 0.4,
  },
  focusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.teal,
    marginTop: 6,
    position: 'absolute',
    bottom: -12,
  },
});

