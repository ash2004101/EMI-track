import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Loan } from '../types';
import { Colors, FontSize, FontWeight, Radius, Spacing, LoanTypeColors, LoanTypeIcons } from '../constants/theme';

interface LoanCardProps {
  loan: Loan;
  paymentsCount?: number;
  onPress: () => void;
}

function getDaysUntilDue(dueDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = dueDateStr.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dueDateStr: string): string {
  const [year, month, day] = dueDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDueDateLabel(days: number, status: Loan['status']): { text: string; color: string } {
  if (status === 'Paid') return { text: 'All Clear', color: Colors.success };
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, color: Colors.danger };
  if (days === 0) return { text: 'Due Today!', color: Colors.danger };
  if (days === 1) return { text: 'Due Tomorrow', color: Colors.warning };
  if (days <= 7) return { text: `${days}d left`, color: Colors.warning };
  return { text: `${days}d left`, color: Colors.textSecondary };
}

export default function LoanCard({ loan, paymentsCount, onPress }: LoanCardProps) {
  const typeColor = LoanTypeColors[loan.type] || Colors.loanOther;
  const iconName = LoanTypeIcons[loan.type] || 'more-horiz';
  const days = getDaysUntilDue(loan.dueDate);
  const dueLabel = getDueDateLabel(days, loan.status);
  const amountStr = new Intl.NumberFormat('en-IN').format(loan.emiAmount);

  const statusColors = {
    Paid: { bg: Colors.successAlpha, text: Colors.success },
    Pending: { bg: Colors.primaryAlpha, text: Colors.primaryLight },
    Overdue: { bg: Colors.dangerAlpha, text: Colors.danger },
  };
  const statusStyle = statusColors[loan.status];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.accentGradient, { backgroundColor: typeColor }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: typeColor + '22' }]}>
            <MaterialIcons name={iconName as any} size={22} color={typeColor} />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.loanName} numberOfLines={1}>{loan.name}</Text>
            <Text style={[styles.loanType, { color: typeColor }]}>{loan.type} Loan</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.text + '44' }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{loan.status}</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.label}>EMI Amount</Text>
            <Text style={styles.amount} adjustsFontSizeToFit numberOfLines={1}>₹{amountStr}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.label}>Next Due</Text>
            <Text style={styles.dueDate}>{formatDate(loan.dueDate)}</Text>
            <Text style={[styles.daysLabel, { color: dueLabel.color }]}>{dueLabel.text}</Text>
          </View>
        </View>

        {paymentsCount !== undefined && loan.totalDues > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>Payments</Text>
              <Text style={styles.progressValue}>{paymentsCount} / {loan.totalDues}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    backgroundColor: typeColor, 
                    width: `${Math.min((paymentsCount / loan.totalDues) * 100, 100)}%` 
                  }
                ]} 
              />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.md,
    marginVertical: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  accentGradient: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  loanName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  loanType: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.sm,
    padding: 10,
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  amount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
  },
  dueDate: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  daysLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
  },
  progressValue: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
