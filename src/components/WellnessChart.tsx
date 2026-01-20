import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, typography, borderRadius } from '../theme';
import { WellnessEntry } from '../types/premium';
import { formatChartData, getWellnessColor, getWellnessLabel, getWellnessUnit } from '../utils/wellnessAnalytics';

interface WellnessChartProps {
  data: WellnessEntry[];
  type: 'weight' | 'activity' | 'food' | 'growth';
  period?: string;
}

export const WellnessChart: React.FC<WellnessChartProps> = ({ data, type, period }) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - (spacing.xl * 2);
  
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Aucune donnée disponible pour cette période
        </Text>
        <Text style={styles.emptySubtext}>
          Commencez à enregistrer des mesures pour voir les graphiques
        </Text>
      </View>
    );
  }
  
  const chartData = formatChartData(data);
  const color = getWellnessColor(type);
  const label = getWellnessLabel(type);
  const unit = getWellnessUnit(type);
  
  // Calculer min et max pour l'échelle
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;
  const yAxisMin = Math.max(0, minValue - range * 0.1);
  const yAxisMax = maxValue + range * 0.1;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.period}>{period || 'Tout'}</Text>
      </View>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: chartData.labels,
            datasets: chartData.datasets
          }}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundColor: colors.white,
            backgroundGradientFrom: colors.white,
            backgroundGradientTo: colors.white,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(${hexToRgb(color)}, ${opacity})`,
            labelColor: (opacity = 1) => colors.gray,
            style: {
              borderRadius: borderRadius.lg,
            },
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: color,
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: '#E0E0E0',
              strokeWidth: 1,
            },
          }}
          bezier
          style={styles.chart}
          fromZero={false}
          segments={4}
        />
      </View>
      
      <View style={styles.stats}>
        <StatItem 
          label="Min" 
          value={`${minValue.toFixed(1)} ${unit}`}
          color={color}
        />
        <StatItem 
          label="Moy" 
          value={`${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)} ${unit}`}
          color={color}
        />
        <StatItem 
          label="Max" 
          value={`${maxValue.toFixed(1)} ${unit}`}
          color={color}
        />
      </View>
    </View>
  );
};

const StatItem: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

// Helper pour convertir hex en rgb
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  period: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.lg,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  emptyContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
  },
});








