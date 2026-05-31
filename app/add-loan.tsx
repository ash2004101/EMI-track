import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLoanContext } from '../context/LoanContext';
import FormField from '../components/FormField';
import { Colors, FontSize, FontWeight, Radius, Spacing, LoanTypeColors, LoanTypeIcons } from '../constants/theme';
import { Loan, LoanType } from '../types';

const LOAN_TYPES: LoanType[] = ['Home', 'Bike', 'Car', 'Personal', 'Education', 'Other'];

function generateId(): string {
  return `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function parseDateInput(input: string): string {
  // Accept DD/MM/YYYY or YYYY-MM-DD
  const ddmmyyyy = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
  }
  const yyyymmdd = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyymmdd) return input;
  return '';
}

export default function AddLoanScreen() {
  const router = useRouter();
  const { addLoan } = useLoanContext();

  const [name, setName] = useState('');
  const [type, setType] = useState<LoanType>('Personal');
  const [emiAmount, setEmiAmount] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Loan name is required';
    if (!emiAmount.trim()) {
      errs.emiAmount = 'EMI amount is required';
    } else if (isNaN(Number(emiAmount)) || Number(emiAmount) <= 0) {
      errs.emiAmount = 'Enter a valid numeric amount';
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
      const loan: Loan = {
        id: generateId(),
        name: name.trim(),
        type,
        emiAmount: parseFloat(emiAmount),
        dueDate: parsedDate,
        notes: notes.trim() || undefined,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      await addLoan(loan);
      Alert.alert(
        '✅ Loan Added!',
        `${loan.name} has been added. Notifications have been scheduled for your EMI due date.`,
        [{ text: 'Great!', onPress: () => router.back() }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to save loan. Please try again.');
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
      {/* Loan Type Selector */}
      <Text style={styles.sectionLabel}>Loan Type</Text>
      <View style={styles.typeGrid}>
        {LOAN_TYPES.map((t) => {
          const color = LoanTypeColors[t];
          const icon = LoanTypeIcons[t];
          const selected = type === t;
          return (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeChip,
                { borderColor: color + (selected ? 'ff' : '44') },
                selected && { backgroundColor: color + '22' },
              ]}
              onPress={() => setType(t)}
              activeOpacity={0.7}
            >
              <MaterialIcons name={icon as any} size={18} color={selected ? color : Colors.textMuted} />
              <Text style={[styles.typeChipText, { color: selected ? color : Colors.textMuted }]}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Form Fields */}
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
        label="Due Date"
        value={dueDateInput}
        onChangeText={setDueDateInput}
        placeholder="DD/MM/YYYY"
        icon="event"
        required
        error={errors.dueDate}
      />

      {/* Notes */}
      <FormField
        label="Notes (Optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any notes about this loan..."
        multiline
        icon="notes"
      />

      {/* Notification Preview */}
      <View style={styles.notifPreview}>
        <MaterialIcons name="notifications-active" size={18} color={Colors.primary} />
        <Text style={styles.notifText}>
          4 notifications will be scheduled: day before (9 AM & 4 PM) and due date (9 AM & 5 PM).
        </Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        <MaterialIcons name={saving ? 'hourglass-empty' : 'add-circle'} size={22} color="#fff" />
        <Text style={styles.saveBtnText}>{saving ? 'Adding Loan...' : 'Add Loan'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  typeChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  notifPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryAlpha,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
  },
  notifText: {
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
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
});
