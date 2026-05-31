import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';
import { useLoanContext } from '../../context/LoanContext';
import { Colors, FontSize, FontWeight, Radius, Spacing, LoanTypeColors } from '../../constants/theme';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { loans, payments } = useLoanContext();

  // Calculate Total Payable per category
  const categoryTotals: Record<string, number> = {};
  let totalPayable = 0;
  let totalPaid = 0;

  loans.forEach((loan) => {
    const loanTotal = loan.emiAmount * (loan.totalDues || 0);
    const type = loan.type;
    categoryTotals[type] = (categoryTotals[type] || 0) + loanTotal;
    totalPayable += loanTotal;
  });

  Object.values(payments).flat().forEach(p => {
    totalPaid += p.amount;
  });

  const totalOutstanding = Math.max(0, totalPayable - totalPaid);

  const pieData = Object.keys(categoryTotals).map((type) => ({
    name: type,
    population: categoryTotals[type],
    color: LoanTypeColors[type] || Colors.primary,
    legendFontColor: Colors.textSecondary,
    legendFontSize: 12,
  })).filter(d => d.population > 0);

  const formatCurrency = (val: number) => `₹${new Intl.NumberFormat('en-IN').format(val)}`;

  const chartConfig = {
    backgroundGradientFrom: Colors.bgCard,
    backgroundGradientTo: Colors.bgCard,
    color: (opacity = 1) => `rgba(123, 97, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Portfolio Overview</Text>
      
      {/* Overview Cards */}
      <View style={styles.cardStack}>
        <View style={[styles.card, { backgroundColor: Colors.dangerAlpha }]}>
          <MaterialIcons name="account-balance-wallet" size={24} color={Colors.danger} />
          <Text style={styles.cardLabel}>Total Outstanding</Text>
          <Text style={styles.cardValue} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(totalOutstanding)}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: Colors.successAlpha }]}>
          <MaterialIcons name="check-circle" size={24} color={Colors.success} />
          <Text style={styles.cardLabel}>Total Paid</Text>
          <Text style={styles.cardValue} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(totalPaid)}</Text>
        </View>
      </View>

      {/* Distribution Pie Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Loan Distribution</Text>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={screenWidth - Spacing.md * 4}
            height={220}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            center={[10, 0]}
            absolute
          />
        ) : (
          <Text style={styles.emptyText}>No data to display. Add your first loan.</Text>
        )}
      </View>

      {/* Monthly Outflow Bar Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Top 5 EMI Outflows</Text>
        {loans.length > 0 ? (
          <BarChart
            data={{
              labels: loans.slice(0, 5).map(l => l.name.substring(0, 5) + '..'),
              datasets: [
                {
                  data: loans.slice(0, 5).map(l => l.emiAmount),
                },
              ],
            }}
            width={screenWidth - Spacing.md * 4}
            height={220}
            yAxisLabel="₹"
            yAxisSuffix=""
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(0, 255, 163, ${opacity})`,
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        ) : (
          <Text style={styles.emptyText}>No loans added yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  cardStack: {
    flexDirection: 'column',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  cardLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  cardValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  chartContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  emptyText: {
    color: Colors.textMuted,
    padding: Spacing.xl,
    textAlign: 'center',
  }
});
