import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  multiline?: boolean;
  error?: string;
  icon?: string;
  required?: boolean;
  editable?: boolean;
  onPress?: () => void;
}

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  error,
  icon,
  required = false,
  editable = true,
  onPress,
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
        style={[
          styles.inputRow,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          (!editable && !onPress) && styles.inputDisabled,
        ]}
      >
        {icon && (
          <MaterialIcons
            name={icon as any}
            size={18}
            color={focused ? Colors.primary : Colors.textMuted}
            style={styles.icon}
          />
        )}
        <View style={styles.inputContainer} pointerEvents={onPress ? "none" : "auto"}>
          <TextInput
            style={[styles.input, multiline && styles.multiline]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors.textMuted}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            editable={onPress ? false : editable}
            selectionColor={Colors.primary}
          />
        </View>
      </TouchableOpacity>
      {error ? (
        <View style={styles.errorRow}>
          <MaterialIcons name="error-outline" size={12} color={Colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.danger,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryAlpha,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
  },
});
