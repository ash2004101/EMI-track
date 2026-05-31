import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Payment } from '../types';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

interface PaymentHistoryItemProps {
  payment: Payment;
}

export default function PaymentHistoryItem({ payment }: PaymentHistoryItemProps) {
  const paidDate = new Date(payment.paidAt);
  const dateStr = paidDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = paidDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const amountStr = new Intl.NumberFormat('en-IN').format(payment.amount);

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="check-circle" size={20} color={Colors.success} />
      </View>
      <View style={styles.info}>
        <Text style={styles.month}>{payment.month}</Text>
        <Text style={styles.datetime}>{dateStr} · {timeStr}</Text>
      </View>
      <View style={styles.amountWrap}>
        <Text style={styles.amount}>₹{amountStr}</Text>
        <View style={styles.paidBadge}>
          <Text style={styles.paidText}>Paid</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.successAlpha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  month: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  datetime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  amountWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
  paidBadge: {
    backgroundColor: Colors.successAlpha,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  paidText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.success,
  },
});
