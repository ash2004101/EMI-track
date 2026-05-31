import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLoanContext } from '../../context/LoanContext';
import PaymentHistoryItem from '../../components/PaymentHistoryItem';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  LoanTypeColors,
  LoanTypeIcons,
} from '../../constants/theme';

function formatDate(dueDateStr: string): string {
  const [year, month, day] = dueDateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getDaysUntilDue(dueDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = dueDateStr.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getLoanById, payments, loadPaymentsForLoan, markAsPaid, deleteLoan } =
    useLoanContext();

  const loan = getLoanById(id);

  useEffect(() => {
    if (id) loadPaymentsForLoan(id);
  }, [id, loadPaymentsForLoan]);

  if (!loan) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="error-outline" size={48} color={Colors.danger} />
        <Text style={styles.notFound}>Loan not found</Text>
      </View>
    );
  }

  const loanPayments = payments[id] || [];
  const typeColor = LoanTypeColors[loan.type] || Colors.loanOther;
  const iconName = LoanTypeIcons[loan.type] || 'more-horiz';
  const amountStr = new Intl.NumberFormat('en-IN').format(loan.emiAmount);
  const days = getDaysUntilDue(loan.dueDate);

  const statusConfig = {
    Paid: { bg: Colors.successAlpha, text: Colors.success, icon: 'check-circle' },
    Pending: { bg: Colors.primaryAlpha, text: Colors.primaryLight, icon: 'schedule' },
    Overdue: { bg: Colors.dangerAlpha, text: Colors.danger, icon: 'error' },
  };
  const sc = statusConfig[loan.status];

  const handleMarkPaid = () => {
    Alert.alert(
      'Mark as Paid',
      `Confirm payment of ₹${amountStr} for ${loan.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            await markAsPaid(id);
            // Reload payments
            await loadPaymentsForLoan(id);
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      '🗑️ Delete Loan',
      `Are you sure you want to delete "${loan.name}"? All payment history and notifications will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteLoan(id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Card */}
      <View style={[styles.heroCard, { borderTopColor: typeColor }]}>
        <View style={styles.heroTop}>
          <View style={[styles.heroIcon, { backgroundColor: typeColor + '22' }]}>
            <MaterialIcons name={iconName as any} size={32} color={typeColor} />
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{loan.name}</Text>
            <Text style={[styles.heroType, { color: typeColor }]}>{loan.type} Loan</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <MaterialIcons name={sc.icon as any} size={14} color={sc.text} />
            <Text style={[styles.statusText, { color: sc.text }]}>{loan.status}</Text>
          </View>
        </View>

        <View style={styles.heroAmount}>
          <Text style={styles.emiLabel}>Monthly EMI</Text>
          <Text style={styles.emiAmount}>₹{amountStr}</Text>
        </View>

        {/* Due Date Row */}
        <View style={styles.dueDateRow}>
          <View style={styles.dueDateItem}>
            <MaterialIcons name="event" size={16} color={Colors.textMuted} />
            <Text style={styles.dueDateLabel}>Due Date</Text>
            <Text style={styles.dueDateValue}>{formatDate(loan.dueDate)}</Text>
          </View>
          {loan.status !== 'Paid' && (
            <View
              style={[
                styles.daysChip,
                {
                  backgroundColor:
                    days < 0
                      ? Colors.dangerAlpha
                      : days <= 3
                      ? Colors.warningAlpha
                      : Colors.primaryAlpha,
                },
              ]}
            >
              <Text
                style={[
                  styles.daysText,
                  {
                    color:
                      days < 0
                        ? Colors.danger
                        : days <= 3
                        ? Colors.warning
                        : Colors.primaryLight,
                  },
                ]}
              >
                {days < 0
                  ? `${Math.abs(days)}d overdue`
                  : days === 0
                  ? 'Due today!'
                  : days === 1
                  ? 'Due tomorrow'
                  : `${days} days left`}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Notes */}
      {loan.notes ? (
        <View style={styles.notesCard}>
          <MaterialIcons name="notes" size={16} color={Colors.primary} />
          <Text style={styles.notesText}>{loan.notes}</Text>
        </View>
      ) : null}

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Loan Type</Text>
          <Text style={[styles.infoValue, { color: typeColor }]}>{loan.type}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Added On</Text>
          <Text style={styles.infoValue}>
            {new Date(loan.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Payments Made</Text>
          <Text style={styles.infoValue}>{loanPayments.length}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Total Paid</Text>
          <Text style={[styles.infoValue, { color: Colors.success }]}>
            ₹{new Intl.NumberFormat('en-IN').format(
              loanPayments.reduce((s, p) => s + p.amount, 0)
            )}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {loan.status !== 'Paid' && (
          <TouchableOpacity style={styles.payBtn} onPress={handleMarkPaid} activeOpacity={0.8}>
            <MaterialIcons name="check-circle" size={20} color="#fff" />
            <Text style={styles.payBtnText}>Mark as Paid</Text>
          </TouchableOpacity>
        )}
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/edit-loan/${id}`)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="edit" size={18} color={Colors.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
            <MaterialIcons name="delete" size={18} color={Colors.danger} />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment History */}
      <Text style={styles.historyTitle}>
        Payment History
        {loanPayments.length > 0 && (
          <Text style={styles.historyCount}> ({loanPayments.length})</Text>
        )}
      </Text>
      {loanPayments.length === 0 ? (
        <View style={styles.noHistory}>
          <MaterialIcons name="receipt-long" size={36} color={Colors.textMuted} />
          <Text style={styles.noHistoryText}>No payments recorded yet</Text>
        </View>
      ) : (
        [...loanPayments].reverse().map((p) => (
          <PaymentHistoryItem key={p.id} payment={p} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.bg,
  },
  notFound: { fontSize: FontSize.lg, color: Colors.textSecondary },

  heroCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 3,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: { flex: 1 },
  heroName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  heroType: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  heroAmount: { marginBottom: Spacing.md },
  emiLabel: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 2 },
  emiAmount: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dueDateItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dueDateLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  dueDateValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  daysChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  daysText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  notesCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryAlpha,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
  },
  notesText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  infoItem: {
    width: '50%',
    padding: Spacing.md,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: Colors.border,
  },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  infoValue: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },

  actions: { gap: Spacing.sm, marginBottom: Spacing.lg },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  payBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
  secondaryActions: { flexDirection: 'row', gap: Spacing.sm },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryAlpha,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  editBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dangerAlpha,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.danger + '44',
  },
  deleteBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.danger },

  historyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  historyCount: { color: Colors.textMuted },
  noHistory: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noHistoryText: { fontSize: FontSize.md, color: Colors.textMuted },
});
