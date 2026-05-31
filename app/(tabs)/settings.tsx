import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLoanContext } from '../../context/LoanContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { NotificationSettings } from '../../types';
import { getScheduledNotificationsCount } from '../../services/notifications';

const TIME_OPTIONS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00',
];

function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

interface TimePickerRowProps {
  label: string;
  subtitle: string;
  icon: string;
  value: string;
  onChange: (val: string) => void;
}

function TimePickerRow({ label, subtitle, icon, value, onChange }: TimePickerRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.timeCard}>
      <TouchableOpacity
        style={styles.timeHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={[styles.timeIconWrap, { backgroundColor: Colors.primaryAlpha }]}>
          <MaterialIcons name={icon as any} size={20} color={Colors.primary} />
        </View>
        <View style={styles.timeLabelWrap}>
          <Text style={styles.timeLabel}>{label}</Text>
          <Text style={styles.timeSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.timeValueWrap}>
          <Text style={styles.timeValue}>{formatTime12h(value)}</Text>
          <MaterialIcons
            name={expanded ? 'expand-less' : 'expand-more'}
            size={20}
            color={Colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.timeOptions}>
          {TIME_OPTIONS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.timeOption,
                t === value && styles.timeOptionSelected,
              ]}
              onPress={() => {
                onChange(t);
                setExpanded(false);
              }}
            >
              <Text
                style={[
                  styles.timeOptionText,
                  t === value && styles.timeOptionTextSelected,
                ]}
              >
                {formatTime12h(t)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function SettingsScreen() {
  const { notificationSettings, updateNotificationSettings, loans } = useLoanContext();
  const [local, setLocal] = useState<NotificationSettings>(notificationSettings);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocal(notificationSettings);
  }, [notificationSettings]);

  useEffect(() => {
    getScheduledNotificationsCount().then(setScheduledCount);
  }, []);

  const hasChanges =
    local.dayBeforeMorning !== notificationSettings.dayBeforeMorning ||
    local.dayBeforeAfternoon !== notificationSettings.dayBeforeAfternoon ||
    local.dueDateMorning !== notificationSettings.dueDateMorning ||
    local.dueDateEvening !== notificationSettings.dueDateEvening;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateNotificationSettings(local);
      const count = await getScheduledNotificationsCount();
      setScheduledCount(count);
      Alert.alert(
        '✅ Settings Saved',
        `Notifications rescheduled for ${loans.filter(l => l.status !== 'Paid').length} active loan(s).`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Banner */}
      <View style={styles.statusBanner}>
        <MaterialIcons name="notifications-active" size={22} color={Colors.primary} />
        <View style={styles.statusText}>
          <Text style={styles.statusTitle}>Notification Status</Text>
          <Text style={styles.statusSub}>{scheduledCount} notifications scheduled</Text>
        </View>
      </View>

      {/* Day Before Section */}
      <Text style={styles.sectionLabel}>📅 Day Before Due Date</Text>
      <Text style={styles.sectionDesc}>
        Receive two reminders the day before your EMI is due.
      </Text>
      <TimePickerRow
        label="Morning Reminder"
        subtitle="Day before at"
        icon="wb-sunny"
        value={local.dayBeforeMorning}
        onChange={(v) => setLocal((s) => ({ ...s, dayBeforeMorning: v }))}
      />
      <TimePickerRow
        label="Afternoon Reminder"
        subtitle="Day before at"
        icon="wb-cloudy"
        value={local.dayBeforeAfternoon}
        onChange={(v) => setLocal((s) => ({ ...s, dayBeforeAfternoon: v }))}
      />

      {/* Due Date Section */}
      <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>🔔 On Due Date</Text>
      <Text style={styles.sectionDesc}>
        Get alerted on the day of your EMI.
      </Text>
      <TimePickerRow
        label="Morning Alert"
        subtitle="Due date at"
        icon="alarm"
        value={local.dueDateMorning}
        onChange={(v) => setLocal((s) => ({ ...s, dueDateMorning: v }))}
      />
      <TimePickerRow
        label="Evening Pending Alert"
        subtitle="If unpaid, due date at"
        icon="alarm-on"
        value={local.dueDateEvening}
        onChange={(v) => setLocal((s) => ({ ...s, dueDateEvening: v }))}
      />

      {/* Info Box */}
      <View style={styles.infoBox}>
        <MaterialIcons name="info-outline" size={16} color={Colors.primary} />
        <Text style={styles.infoText}>
          Changes will reschedule notifications for all active loans automatically.
          Paid loans are not rescheduled.
        </Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, !hasChanges && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={!hasChanges || saving}
        activeOpacity={0.8}
      >
        <MaterialIcons name="save" size={20} color={Colors.textInverse} />
        <Text style={styles.saveBtnText}>
          {saving ? 'Rescheduling...' : 'Save & Reschedule'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryAlpha,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  statusText: { flex: 1 },
  statusTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  statusSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionDesc: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  timeCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  timeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLabelWrap: { flex: 1 },
  timeLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  timeSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  timeValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
    paddingTop: 0,
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  timeOption: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeOptionText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  timeOptionTextSelected: {
    color: '#fff',
    fontWeight: FontWeight.semibold,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryAlpha,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
  },
  infoText: {
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
    padding: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
});
