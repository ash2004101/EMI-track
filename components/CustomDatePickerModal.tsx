import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => String(currentYear + i));

interface CustomDatePickerModalProps {
  visible: boolean;
  value: string; // YYYY-MM-DD
  onClose: () => void;
  onSave: (val: string) => void;
  title: string;
}

export default function CustomDatePickerModal({ visible, value, onClose, onSave, title }: CustomDatePickerModalProps) {
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    if (visible) {
      if (value) {
        const [y, m, d] = value.split('-');
        setSelectedYear(y);
        setSelectedMonth(m);
        setSelectedDay(d);
      } else {
        const now = new Date();
        setSelectedYear(String(now.getFullYear()));
        setSelectedMonth(String(now.getMonth() + 1).padStart(2, '0'));
        setSelectedDay(String(now.getDate()).padStart(2, '0'));
      }
    }
  }, [visible, value]);

  const handleSave = () => {
    onSave(`${selectedYear}-${selectedMonth}-${selectedDay}`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerColumnLabel}>Day</Text>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
                {DAYS.map((d) => (
                  <TouchableOpacity key={d} style={[styles.pickerItem, selectedDay === d && styles.pickerItemSelected]} onPress={() => setSelectedDay(d)}>
                    <Text style={[styles.pickerItemText, selectedDay === d && styles.pickerItemTextSelected]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerColumnLabel}>Month</Text>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
                {MONTHS.map((m) => (
                  <TouchableOpacity key={m} style={[styles.pickerItem, selectedMonth === m && styles.pickerItemSelected]} onPress={() => setSelectedMonth(m)}>
                    <Text style={[styles.pickerItemText, selectedMonth === m && styles.pickerItemTextSelected]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerColumnLabel}>Year</Text>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
                {YEARS.map((y) => (
                  <TouchableOpacity key={y} style={[styles.pickerItem, selectedYear === y && styles.pickerItemSelected]} onPress={() => setSelectedYear(y)}>
                    <Text style={[styles.pickerItemText, selectedYear === y && styles.pickerItemTextSelected]}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.modalSaveBtnText}>Confirm Date</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 240,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerColumnLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  pickerScroll: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    marginVertical: 4,
  },
  pickerItemSelected: {
    backgroundColor: Colors.primaryAlpha,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  pickerItemText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  pickerItemTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  modalSaveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
});
