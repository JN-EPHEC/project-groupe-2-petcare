import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

// Clé API Google Places - ATTENTION : Ne pas committer sur Git !
const GOOGLE_PLACES_API_KEY = 'AIzaSyBtEwktPtW8gXEANn0yf_kWlkSh9ElQtY0';

interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  onAddressSelect: (address: string, city: string, fullDetails: any) => void;
  defaultValue?: string;
}

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  label = 'Adresse',
  placeholder = 'Rechercher une adresse...',
  onAddressSelect,
  defaultValue = '',
}) => {
  const [searchText, setSearchText] = useState(defaultValue);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sur web, désactiver l'autocomplétion (nécessite SDK JavaScript)
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (isWeb || searchText.length <= 2) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }
    
    // Debounce: attendre 500ms avant de chercher
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      fetchPredictions(searchText);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchText, isWeb]);

  const fetchPredictions = async (input: string) => {
    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === 'VOTRE_CLE_API_GOOGLE_ICI') {
      console.warn('⚠️ Clé API Google Places non configurée');
      return;
    }

    // Pour le web, on a besoin d'un proxy ou du SDK JavaScript
    // Pour l'instant, on affiche juste un message
    if (Platform.OS === 'web') {
      console.warn('⚠️ Autocomplétion Google Places nécessite le SDK JavaScript pour le web');
      console.warn('💡 Utilisez la saisie manuelle pour l\'instant');
      return;
    }

    setIsLoading(true);
    try {
      // Cette API nécessite un proxy serveur pour éviter les problèmes CORS
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_PLACES_API_KEY}&language=fr&components=country:be&types=address`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        setPredictions(data.predictions);
        setShowPredictions(true);
      } else {
        console.warn('Places API error:', data.status, data.error_message);
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlaceDetails = async (placeId: string) => {
    setIsLoading(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}&language=fr&fields=formatted_address,address_components,geometry`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const result = data.result;
        const fullAddress = result.formatted_address;
        
        // Extraire la ville
        let city = '';
        const addressComponents = result.address_components || [];
        
        for (const component of addressComponents) {
          if (component.types.includes('locality')) {
            city = component.long_name;
            break;
          }
          if (component.types.includes('administrative_area_level_2')) {
            city = component.long_name;
          }
        }

        if (!city && fullAddress) {
          const parts = fullAddress.split(',');
          city = parts[parts.length - 2]?.trim() || parts[0]?.trim() || '';
        }

        console.log('✅ Selected address:', fullAddress);
        console.log('✅ Extracted city:', city);

        onAddressSelect(fullAddress, city, result);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPrediction = (prediction: PlacePrediction) => {
    setSearchText(prediction.description);
    setShowPredictions(false);
    setPredictions([]);
    fetchPlaceDetails(prediction.place_id);
  };

  const renderPrediction = ({ item }: { item: PlacePrediction }) => (
    <TouchableOpacity
      style={styles.predictionItem}
      onPress={() => handleSelectPrediction(item)}
    >
      <Ionicons name="location-outline" size={20} color={colors.navy} style={styles.predictionIcon} />
      <View style={styles.predictionTextContainer}>
        <Text style={styles.predictionMainText}>{item.structured_formatting.main_text}</Text>
        <Text style={styles.predictionSecondaryText}>{item.structured_formatting.secondary_text}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Ionicons name="location-outline" size={20} color={colors.navy} />
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.gray}
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => {
            if (predictions.length > 0) {
              setShowPredictions(true);
            }
          }}
        />
        {isLoading && (
          <ActivityIndicator size="small" color={colors.teal} style={styles.loader} />
        )}
        {searchText.length > 0 && !isLoading && (
          <TouchableOpacity
            onPress={() => {
              setSearchText('');
              setPredictions([]);
              setShowPredictions(false);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color={colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      {showPredictions && predictions.length > 0 && (
        <View style={styles.predictionsContainer}>
          <FlatList
            data={predictions}
            renderItem={renderPrediction}
            keyExtractor={(item) => item.place_id}
            style={styles.predictionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {isWeb && (
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={20} color={colors.teal} />
          <Text style={styles.infoText}>
            💡 Sur le web, saisissez l'adresse manuellement. L'autocomplétion est disponible sur mobile.
          </Text>
        </View>
      )}

      {(!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === 'VOTRE_CLE_API_GOOGLE_ICI') && !isWeb && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color="#FF9800" />
          <Text style={styles.warningText}>
            ⚠️ Clé API Google Places non configurée. Voir GOOGLE_PLACES_SETUP.md
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    zIndex: 1000,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.navy,
    height: '100%',
    outlineStyle: 'none', // Pour le web
  },
  loader: {
    marginLeft: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  predictionsContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    maxHeight: 250,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  predictionsList: {
    maxHeight: 250,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  predictionIcon: {
    marginRight: spacing.sm,
  },
  predictionTextContainer: {
    flex: 1,
  },
  predictionMainText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs / 2,
  },
  predictionSecondaryText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.navy,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  warningText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: '#F57C00',
  },
});

