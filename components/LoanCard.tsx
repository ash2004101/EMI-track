import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Loan } from '../types';
import { Colors, FontSize, FontWeight, Radius, Spacing, LoanTypeColors, LoanTypeIcons } from '../constants/theme';

interface LoanCardProps {
  loan: Loan;
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
  if (status === 'Paid') return { text: 'Paid', color: Colors.success };
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, color: Colors.danger };
  if (days === 0) return { text: 'Due Today!', color: Colors.danger };
  if (days === 1) return { text: 'Due Tomorrow', color: Colors.warning };
  if (days <= 7) return { text: `${days}d left`, color: Colors.warning };
  return { text: `${days}d left`, color: Colors.textSecondary };
}

export default function LoanCard({ loan, onPress }: LoanCardProps) {
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
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: typeColor }]} />

      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: typeColor + '22' }]}>
            <MaterialIcons name={iconName as any} size={20} color={typeColor} />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.loanName} numberOfLines={1}>{loan.name}</Text>
            <Text style={[styles.loanType, { color: typeColor }]}>{loan.type} Loan</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{loan.status}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Footer row */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.label}>Monthly EMI</Text>
            <Text style={styles.amount}>₹{amountStr}</Text>
          </View>
          <View style={styles.rightInfo}>
            <Text style={styles.label}>Due Date</Text>
            <Text style={styles.dueDate}>{formatDate(loan.dueDate)}</Text>
            <Text style={[styles.daysLabel, { color: dueLabel.color }]}>{dueLabel.text}</Text>
          </View>
        </View>
      </View>

      <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm / 2,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
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
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  amount: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  dueDate: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  daysLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    marginTop: 2,
  },
  chevron: {
    alignSelf: 'center',
    marginRight: Spacing.xs,
  },
});
