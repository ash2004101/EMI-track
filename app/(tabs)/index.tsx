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
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLoanContext } from '../../context/LoanContext';
import LoanCard from '../../components/LoanCard';
import AnimatedTouchable from '../../components/AnimatedTouchable';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { Loan } from '../../types';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const amountStr = new Intl.NumberFormat('en-IN').format(totalMonthly);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your wallet...</Text>
      </View>
    );
  }

  const WalletHeader = () => (
    <View style={styles.walletContainer}>
      <View style={styles.walletCard}>
        <View style={styles.walletGlow} />
        <View style={styles.walletTopRow}>
          <Text style={styles.walletLabel}>TOTAL MONTHLY EMI</Text>
          <MaterialIcons name="account-balance-wallet" size={24} color={Colors.primaryLight} />
        </View>
        <View style={styles.walletAmountWrap}>
          <Text style={styles.walletAmount} adjustsFontSizeToFit numberOfLines={1}>
            ₹ {amountStr}
          </Text>
        </View>
        <View style={styles.walletBottomRow}>
          <View style={styles.walletStat}>
            <Text style={styles.walletStatValue}>{loans.length}</Text>
            <Text style={styles.walletStatLabel}>Active Loans</Text>
          </View>
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {filterOptions.map(option => (
          <AnimatedTouchable
            key={option}
            style={[styles.filterChip, activeFilter === option && styles.filterChipActive]}
            onPress={() => setActiveFilter(option)}
          >
            <Text style={[styles.filterText, activeFilter === option && styles.filterTextActive]}>
              {option}
            </Text>
          </AnimatedTouchable>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {sortedLoans.length > 0 ? 'Your Loans' : ''}
        </Text>
      </View>
    </View>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <MaterialIcons name="insights" size={48} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Your Wallet is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Tap the floating + button to add your first EMI and start tracking your payments in style.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedLoans}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={WalletHeader}
        ListEmptyComponent={EmptyComponent}
        renderItem={({ item }: { item: Loan }) => (
          <LoanCard
            loan={item}
            paymentsCount={(payments[item.id] || []).length}
            onPress={() => router.push(`/loan/${item.id}`)}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: Math.max(insets.bottom, 16) + 120 }]}
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
        style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 100 }]}
        activeOpacity={0.8}
        onPress={() => router.push('/add-loan')}
      >
        <Feather name="plus" size={32} color="#FFFFFF" />
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
    fontWeight: FontWeight.semibold,
  },
  list: {
    paddingBottom: 0, // Handled dynamically in component
  },
  walletContainer: {
    paddingTop: Spacing.sm,
  },
  walletCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  walletGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primary,
    opacity: 0.15,
  },
  walletTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  walletLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.5,
  },
  walletAmountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  walletAmount: {
    fontSize: 48,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  walletBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 6,
  },
  walletStatValue: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
  walletStatLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  filterScroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  filterChipActive: {
    backgroundColor: Colors.primaryAlpha,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: Colors.primaryLight,
    fontWeight: FontWeight.extrabold,
  },
  sectionHeader: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  emptyWrap: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.md,
  },
  emptyIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  fab: {
    position: 'absolute',
    // bottom handled dynamically via useSafeAreaInsets inline
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
});
