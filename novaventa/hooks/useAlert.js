import { useState } from 'react';

export const useAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: []
  });

  const showAlert = (title, message, type = 'info', buttons = []) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const alert = {
    show: (title, message) => showAlert(title, message, 'info'),
    success: (title, message) => showAlert(title, message, 'success'),
    error: (title, message) => showAlert(title, message, 'error'),
    warning: (title, message) => showAlert(title, message, 'warning'),
    confirm: (title, message, onConfirm, onCancel) => {
      showAlert(title, message, 'confirm', [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: onCancel
        },
        {
          text: 'Confirmar',
          onPress: onConfirm
        }
      ]);
    },
    confirmDestructive: (title, message, onConfirm, confirmText = 'Eliminar') => {
      showAlert(title, message, 'warning', [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: confirmText,
          style: 'destructive',
          onPress: onConfirm
        }
      ]);
    }
  };

  return { alert, alertConfig, hideAlert };
};
