import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLoanContext } from '../../context/LoanContext';
import AnimatedTouchable from '../../components/AnimatedTouchable';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { NotificationSettings } from '../../types';
import { getScheduledNotificationsCount } from '../../services/notifications';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

// ─── CUSTOM TIME PICKER MODAL ────────────────────────────────────────────────
interface CustomTimePickerModalProps {
  visible: boolean;
  value: string; // HH:mm in 24hr format
  onClose: () => void;
  onSave: (val: string) => void;
  title: string;
}

function CustomTimePickerModal({ visible, value, onClose, onSave, title }: CustomTimePickerModalProps) {
  // Parse initial 24h string into internal state
  const [h, m] = value.split(':').map(Number);
  const [selectedHour, setSelectedHour] = useState(String(h % 12 || 12).padStart(2, '0'));
  const [selectedMinute, setSelectedMinute] = useState(String(m).padStart(2, '0'));
  const [selectedAmPm, setSelectedAmPm] = useState(h >= 12 ? 'PM' : 'AM');

  useEffect(() => {
    if (visible) {
      const [initH, initM] = value.split(':').map(Number);
      setSelectedHour(String(initH % 12 || 12).padStart(2, '0'));
      setSelectedMinute(String(initM).padStart(2, '0'));
      setSelectedAmPm(initH >= 12 ? 'PM' : 'AM');
    }
  }, [visible, value]);

  const handleSave = () => {
    let hour24 = parseInt(selectedHour, 10);
    if (selectedAmPm === 'PM' && hour24 !== 12) hour24 += 12;
    if (selectedAmPm === 'AM' && hour24 === 12) hour24 = 0;
    
    const final24 = `${String(hour24).padStart(2, '0')}:${selectedMinute}`;
    onSave(final24);
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
            {/* Hours Column */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerColumnLabel}>Hour</Text>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
                {HOURS.map((hr) => (
                  <TouchableOpacity
                    key={hr}
                    style={[styles.pickerItem, selectedHour === hr && styles.pickerItemSelected]}
                    onPress={() => setSelectedHour(hr)}
                  >
                    <Text style={[styles.pickerItemText, selectedHour === hr && styles.pickerItemTextSelected]}>
                      {hr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Minutes Column */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerColumnLabel}>Minute</Text>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
                {MINUTES.map((min) => (
                  <TouchableOpacity
                    key={min}
                    style={[styles.pickerItem, selectedMinute === min && styles.pickerItemSelected]}
                    onPress={() => setSelectedMinute(min)}
                  >
                    <Text style={[styles.pickerItemText, selectedMinute === min && styles.pickerItemTextSelected]}>
                      {min}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* AM/PM Column */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerColumnLabel}>AM/PM</Text>
              <View style={styles.amPmContainer}>
                {['AM', 'PM'].map((ampm) => (
                  <TouchableOpacity
                    key={ampm}
                    style={[styles.pickerItem, { marginVertical: 8 }, selectedAmPm === ampm && styles.pickerItemSelected]}
                    onPress={() => setSelectedAmPm(ampm)}
                  >
                    <Text style={[styles.pickerItemText, selectedAmPm === ampm && styles.pickerItemTextSelected]}>
                      {ampm}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.modalSaveBtnText}>Confirm Time</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── TIME ROW COMPONENT ──────────────────────────────────────────────────────
interface TimeRowProps {
  label: string;
  subtitle: string;
  icon: string;
  value: string;
  onPress: () => void;
}

function TimeRow({ label, subtitle, icon, value, onPress }: TimeRowProps) {
  return (
    <View style={styles.timeCard}>
      <View style={[styles.timeIconWrap, { backgroundColor: Colors.primaryAlpha }]}>
        <MaterialIcons name={icon as any} size={20} color={Colors.primary} />
      </View>
      
      <View style={styles.timeLabelWrap}>
        <Text style={styles.timeLabel} numberOfLines={1}>{label}</Text>
        <Text style={styles.timeSubtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
      
      <TouchableOpacity style={styles.timeValueWrap} onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.timeValue}>{formatTime12h(value)}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { notificationSettings, updateNotificationSettings, loans } = useLoanContext();
  const [local, setLocal] = useState<NotificationSettings>(notificationSettings);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [saving, setSaving] = useState(false);

  // View State (main menu vs sub-menus)
  const [activeView, setActiveView] = useState<'main' | 'preDue' | 'dueDate'>('main');

  // Picker State
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activePickerKey, setActivePickerKey] = useState<keyof NotificationSettings | null>(null);

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

  const handleTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Test Reminder',
        body: 'This is what your EMI alerts will look like!',
        sound: true,
      },
      trigger: {
        seconds: 3,
        channelId: 'emi-reminders',
      },
    });
    Alert.alert('Testing', `A test notification will appear in 3 seconds! Minimize the app to see it.`);
  };

  const openPicker = (key: keyof NotificationSettings) => {
    setActivePickerKey(key);
    setPickerVisible(true);
  };

  const handlePickerSave = (newTime: string) => {
    if (activePickerKey) {
      setLocal(prev => ({ ...prev, [activePickerKey]: newTime }));
    }
    setPickerVisible(false);
  };

  const getPickerTitle = () => {
    switch (activePickerKey) {
      case 'dayBeforeMorning': return 'Morning Reminder';
      case 'dayBeforeAfternoon': return 'Afternoon Reminder';
      case 'dueDateMorning': return 'Morning Alert';
      case 'dueDateEvening': return 'Evening Alert';
      default: return 'Set Time';
    }
  };

  // ─── RENDER MAIN MENU ──────────────────────────────────────────────
  if (activeView === 'main') {
    return (
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) + 80 }]}>
        <View style={styles.content}>
          <View style={styles.statusBanner}>
            <MaterialIcons name="notifications-active" size={24} color={Colors.primary} />
            <View style={styles.statusText}>
              <Text style={styles.statusTitle}>Notification Engine Active</Text>
              <Text style={styles.statusSub}>{scheduledCount} reminders queued securely on-device.</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>CONFIGURATION</Text>
          <View style={styles.sectionContainer}>
            <AnimatedTouchable style={styles.menuRow} onPress={() => setActiveView('preDue')}>
              <View style={[styles.timeIconWrap, { backgroundColor: Colors.warningAlpha }]}>
                <MaterialIcons name="event-note" size={20} color={Colors.warning} />
              </View>
              <View style={styles.timeLabelWrap}>
                <Text style={styles.timeLabel}>Pre-Due Alerts</Text>
                <Text style={styles.timeSubtitle}>{formatTime12h(local.dayBeforeMorning)} & {formatTime12h(local.dayBeforeAfternoon)}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
            </AnimatedTouchable>
            <View style={styles.divider} />
            <AnimatedTouchable style={styles.menuRow} onPress={() => setActiveView('dueDate')}>
              <View style={[styles.timeIconWrap, { backgroundColor: Colors.dangerAlpha }]}>
                <MaterialIcons name="alarm" size={20} color={Colors.danger} />
              </View>
              <View style={styles.timeLabelWrap}>
                <Text style={styles.timeLabel}>Due Date Alerts</Text>
                <Text style={styles.timeSubtitle}>{formatTime12h(local.dueDateMorning)} & {formatTime12h(local.dueDateEvening)}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
            </AnimatedTouchable>
          </View>
        </View>

        {/* Fixed Bottom Section (No Scrolling Needed!) */}
        <View style={styles.bottomFixed}>
          <AnimatedTouchable
            style={[styles.saveBtn, !hasChanges && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!hasChanges || saving}
          >
            <MaterialIcons name="done-all" size={20} color={Colors.textInverse} />
            <Text style={styles.saveBtnText}>
              {saving ? 'Synchronizing...' : 'Save & Reschedule'}
            </Text>
          </AnimatedTouchable>

          <AnimatedTouchable style={styles.testBtn} onPress={handleTestNotification}>
            <MaterialIcons name="vibration" size={20} color={Colors.primary} />
            <Text style={styles.testBtnText}>Send Test Notification</Text>
          </AnimatedTouchable>
        </View>
      </View>
    );
  }

  // ─── RENDER SUB-VIEWS (Pre-Due & Due Date) ─────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AnimatedTouchable style={styles.backBtn} onPress={() => setActiveView('main')}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          <Text style={styles.backBtnText}>Back to Settings</Text>
        </AnimatedTouchable>

        <Text style={styles.subViewTitle}>
          {activeView === 'preDue' ? 'Pre-Due Alerts' : 'Due Date Alerts'}
        </Text>
        <Text style={styles.subViewDesc}>
          {activeView === 'preDue' 
            ? 'Set the times you want to receive heads-up reminders the day before an EMI is due.'
            : 'Set the exact times you want to be alerted on the actual day your EMI is due.'}
        </Text>

        <View style={styles.sectionContainer}>
          {activeView === 'preDue' ? (
            <>
              <TimeRow
                label="Morning Check-in"
                subtitle="Day before at"
                icon="wb-sunny"
                value={local.dayBeforeMorning}
                onPress={() => openPicker('dayBeforeMorning')}
              />
              <View style={styles.divider} />
              <TimeRow
                label="Afternoon Reminder"
                subtitle="Day before at"
                icon="wb-cloudy"
                value={local.dayBeforeAfternoon}
                onPress={() => openPicker('dayBeforeAfternoon')}
              />
            </>
          ) : (
            <>
              <TimeRow
                label="Morning Wake-up Alert"
                subtitle="Due date at"
                icon="alarm"
                value={local.dueDateMorning}
                onPress={() => openPicker('dueDateMorning')}
              />
              <View style={styles.divider} />
              <TimeRow
                label="Evening Pending Alert"
                subtitle="If unpaid, due date at"
                icon="alarm-on"
                value={local.dueDateEvening}
                onPress={() => openPicker('dueDateEvening')}
              />
            </>
          )}
        </View>
      </View>

      <CustomTimePickerModal
        visible={pickerVisible}
        title={getPickerTitle()}
        value={activePickerKey ? (local[activePickerKey] as string) : '09:00'}
        onClose={() => setPickerVisible(false)}
        onSave={handlePickerSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'space-between', // Pushes bottomFixed to the very bottom
  },
  content: {
    padding: Spacing.lg,
  },
  bottomFixed: {
    padding: Spacing.lg,
    paddingTop: 0,
    gap: Spacing.md,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  statusText: { flex: 1 },
  statusTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  statusSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.extrabold,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  sectionContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 60,
  },
  timeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLabelWrap: { flex: 1 },
  timeLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  timeSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  testBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primaryLight,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  backBtnText: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subViewTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subViewDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  timeValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  // Modal Styles
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
  amPmContainer: {
    flex: 1,
    justifyContent: 'center',
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
