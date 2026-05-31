import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLoanContext } from '../../context/LoanContext';
import LoanCard from '../../components/LoanCard';
import SummaryCard from '../../components/SummaryCard';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { Loan } from '../../types';

export default function DashboardScreen() {
  const router = useRouter();
  const { loans, payments, loading, refreshLoans, getUpcomingCount, getTotalMonthlyEMI } =
    useLoanContext();

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const filterOptions = ['All', ...new Set(loans.map(loan => loan.type))];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshLoans();
    setRefreshing(false);
  }, [refreshLoans]);

  // Filter and Sort: overdue first, then by due date ascending
  const sortedLoans = [...loans]
    .filter(loan => activeFilter === 'All' || loan.type === activeFilter)
    .sort((a, b) => {
      const statusOrder = { Overdue: 0, Pending: 1, Paid: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.dueDate.localeCompare(b.dueDate);
    });

  const totalMonthly = getTotalMonthlyEMI();
  const upcomingCount = getUpcomingCount();
  const amountStr = new Intl.NumberFormat('en-IN').format(totalMonthly);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading loans...</Text>
      </View>
    );
  }

  const ListHeader = () => (
    <>
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <SummaryCard
          icon="account-balance"
          iconColor={Colors.primary}
          label="Total Loans"
          value={String(loans.length)}
        />
        <SummaryCard
          icon="currency-rupee"
          iconColor={Colors.success}
          label="Monthly EMI"
          value={`₹${amountStr}`}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {filterOptions.map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.filterChip, activeFilter === option && styles.filterChipActive]}
            onPress={() => setActiveFilter(option)}
          >
            <Text style={[styles.filterText, activeFilter === option && styles.filterTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {sortedLoans.length > 0 ? 'Your Loans' : ''}
        </Text>
        {sortedLoans.length > 0 && (
          <Text style={styles.sectionCount}>{sortedLoans.length} loan{sortedLoans.length !== 1 ? 's' : ''}</Text>
        )}
      </View>
    </>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <MaterialIcons name="account-balance" size={56} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Loans Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button below to add your first loan and start tracking EMI payments.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedLoans}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyComponent}
        renderItem={({ item }: { item: Loan }) => (
          <LoanCard
            loan={item}
            paymentsCount={(payments[item.id] || []).length}
            onPress={() => router.push(`/loan/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-loan')}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color={Colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.bg,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  list: {
    paddingBottom: 100,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryAlpha,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  filterTextActive: {
    color: Colors.primaryLight,
    fontWeight: FontWeight.bold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  emptyWrap: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xxl,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryAlpha,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
