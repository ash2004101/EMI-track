import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Loan } from '../types';
import { Colors, FontSize, FontWeight, Radius, Spacing, LoanTypeColors, LoanTypeIcons } from '../constants/theme';
import AnimatedTouchable from './AnimatedTouchable';

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
    <AnimatedTouchable onPress={onPress} style={styles.cardWrapper}>
      <View style={[styles.glowBorder, { backgroundColor: typeColor }]} />
      <View style={styles.card}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <Text style={styles.loanName} numberOfLines={1}>{loan.name}</Text>
              <Text style={[styles.loanType, { color: typeColor }]}>{loan.type} Loan</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.text + '33' }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{loan.status}</Text>
            </View>
          </View>

          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text style={styles.label}>Monthly EMI</Text>
              <Text style={styles.amount} adjustsFontSizeToFit numberOfLines={1}>₹{amountStr}</Text>
            </View>
            <View style={styles.metricItemRight}>
              <Text style={styles.label}>Next Due</Text>
              <Text style={styles.dueDate}>{formatDate(loan.dueDate)}</Text>
              <Text style={[styles.daysLabel, { color: dueLabel.color }]}>{dueLabel.text}</Text>
            </View>
          </View>

          {paymentsCount !== undefined && loan.totalDues > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>Payments Processed</Text>
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
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: Spacing.md,
    marginVertical: 8,
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  glowBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.8,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  content: {
    padding: Spacing.lg,
    paddingLeft: Spacing.lg + 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  titleWrap: {
    flex: 1,
  },
  loanName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  loanType: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  metricItem: {
    flex: 1,
  },
  metricItemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: FontWeight.semibold,
  },
  amount: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
  },
  dueDate: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  daysLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressValue: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
