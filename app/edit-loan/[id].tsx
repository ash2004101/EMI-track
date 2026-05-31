import React, { useEffect, useState } from 'react';
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
import FormField from '../../components/FormField';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
} from '../../constants/theme';
import { Loan } from '../../types';

function toDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function parseDateInput(input: string): string {
  const ddmmyyyy = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
  const yyyymmdd = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyymmdd) return input;
  return '';
}

export default function EditLoanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getLoanById, updateLoan } = useLoanContext();

  const loan = getLoanById(id);

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [totalDues, setTotalDues] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loan) {
      setName(loan.name);
      setType(loan.type);
      setEmiAmount(String(loan.emiAmount));
      setTotalDues(String(loan.totalDues || ''));
      setDueDateInput(toDisplayDate(loan.dueDate));
      setNotes(loan.notes || '');
    }
  }, [loan]);

  if (!loan) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="error-outline" size={48} color={Colors.danger} />
        <Text style={styles.notFound}>Loan not found</Text>
      </View>
    );
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Loan name is required';
    if (!type.trim()) errs.type = 'Loan type is required';

    if (!emiAmount.trim()) {
      errs.emiAmount = 'EMI amount is required';
    } else if (isNaN(Number(emiAmount)) || Number(emiAmount) <= 0) {
      errs.emiAmount = 'Enter a valid numeric amount';
    }
    if (!totalDues.trim()) {
      errs.totalDues = 'Total EMIs required';
    } else if (isNaN(Number(totalDues)) || Number(totalDues) <= 0 || !Number.isInteger(Number(totalDues))) {
      errs.totalDues = 'Enter a valid number of months';
    }
    if (!dueDateInput.trim()) {
      errs.dueDate = 'Due date is required';
    } else {
      const parsed = parseDateInput(dueDateInput);
      if (!parsed) errs.dueDate = 'Use format DD/MM/YYYY';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const parsedDate = parseDateInput(dueDateInput);
      
      const updated: Loan = {
        ...loan,
        name: name.trim(),
        type: type.trim(),
        emiAmount: parseFloat(emiAmount),
        totalDues: parseInt(totalDues, 10),
        dueDate: parsedDate,
        notes: notes.trim() || undefined,
        status: loan.status === 'Paid' ? 'Paid' : 'Pending',
      };
      await updateLoan(updated);
      Alert.alert(
        '✅ Loan Updated',
        `${updated.name} has been updated and notifications rescheduled.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', 'Failed to update loan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Form Fields */}
      <FormField
        label="Loan Type"
        value={type}
        onChangeText={setType}
        placeholder="e.g. Home, Personal, Laptop"
        icon="category"
        required
        error={errors.type}
      />
      <FormField
        label="Loan Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. HDFC Home Loan"
        icon="label"
        required
        error={errors.name}
      />

      <FormField
        label="EMI Amount (₹)"
        value={emiAmount}
        onChangeText={setEmiAmount}
        placeholder="e.g. 15000"
        keyboardType="numeric"
        icon="currency-rupee"
        required
        error={errors.emiAmount}
      />
      <FormField
        label="Total EMIs (Months)"
        value={totalDues}
        onChangeText={setTotalDues}
        placeholder="e.g. 24"
        keyboardType="numeric"
        icon="date-range"
        required
        error={errors.totalDues}
      />
      <FormField
        label="Due Date"
        value={dueDateInput}
        onChangeText={setDueDateInput}
        placeholder="DD/MM/YYYY"
        icon="event"
        required
        error={errors.dueDate}
      />
      <FormField
        label="Notes (Optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any notes..."
        multiline
        icon="notes"
      />

      {/* Reschedule info */}
      <View style={styles.rescheduleInfo}>
        <MaterialIcons name="notifications-active" size={16} color={Colors.warning} />
        <Text style={styles.rescheduleText}>
          Saving will cancel existing notifications and reschedule new ones for the updated due date.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        <MaterialIcons name={saving ? 'hourglass-empty' : 'save'} size={22} color="#fff" />
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
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
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  rescheduleInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.warningAlpha,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.warning + '44',
  },
  rescheduleText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.md + 2,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
});
