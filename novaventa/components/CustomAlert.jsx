import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CustomAlert = ({ visible, title, message, type = 'info', buttons = [], onClose }) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: '✓', color: '#10B981', bg: '#D1FAE5' };
      case 'error':
        return { icon: '✕', color: '#EF4444', bg: '#FEE2E2' };
      case 'warning':
        return { icon: '⚠', color: '#F59E0B', bg: '#FEF3C7' };
      case 'confirm':
        return { icon: '?', color: '#8B5CF6', bg: '#EDE9FE' };
      default:
        return { icon: 'ℹ', color: '#3B82F6', bg: '#DBEAFE' };
    }
  };

  const { icon, color, bg } = getIconAndColor();

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.iconContainer, { backgroundColor: bg }]}>
            <Text style={[styles.icon, { color }]}>{icon}</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttonsContainer}>
            {buttons.length > 0 ? (
              buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'cancel' && styles.cancelButton,
                    button.style === 'destructive' && styles.destructiveButton,
                    buttons.length === 1 && styles.singleButton
                  ]}
                  onPress={() => {
                    if (button.onPress) button.onPress();
                    if (onClose) onClose();
                  }}
                >
                  <Text style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.cancelButtonText,
                    button.style === 'destructive' && styles.destructiveButtonText
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.singleButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  icon: {
    fontSize: 32,
    fontWeight: '700'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center'
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12
  },
  button: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  singleButton: {
    flex: 1
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  destructiveButton: {
    backgroundColor: '#EF4444'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  cancelButtonText: {
    color: '#374151'
  },
  destructiveButtonText: {
    color: 'white'
  }
});

export default CustomAlert;
