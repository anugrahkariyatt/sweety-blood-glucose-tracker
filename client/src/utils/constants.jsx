import React from 'react';
import { Clock, Coffee, Moon, Sun, Utensils } from 'lucide-react';

export const READING_SLOTS = [
  { value: 'MORNING', label: 'Morning (fasting)' },
  { value: 'AFTER_BREAKFAST', label: 'After breakfast' },
  { value: 'AFTER_LUNCH', label: 'After lunch' },
  { value: 'AFTER_DINNER', label: 'After dinner' },
];

export const SLOT_LABELS = {
  MORNING: 'Morning (fasting)',
  AFTER_BREAKFAST: 'After breakfast',
  AFTER_LUNCH: 'After lunch',
  AFTER_DINNER: 'After dinner',
};

export const SLOT_ORDER = [
  'MORNING',
  'AFTER_BREAKFAST',
  'AFTER_LUNCH',
  'AFTER_DINNER',
];

export const SLOT_SHORT_NAMES = {
  MORNING: 'Morning',
  AFTER_BREAKFAST: 'After breakfast',
  AFTER_LUNCH: 'After lunch',
  AFTER_DINNER: 'After dinner',
};

export const getSlotItemStyle = (slot) => {
  switch (slot) {
    case 'MORNING':
      return {
        icon: <Sun className="w-4 h-4 text-sky-600" />,
        bg: 'bg-sky-50 border-sky-100',
        label: 'Morning (fasting)',
      };
    case 'AFTER_BREAKFAST':
      return {
        icon: <Coffee className="w-4 h-4 text-purple-600" />,
        bg: 'bg-purple-50 border-purple-100',
        label: 'After breakfast',
      };
    case 'AFTER_LUNCH':
      return {
        icon: <Utensils className="w-4 h-4 text-amber-600" />,
        bg: 'bg-amber-50 border-amber-100',
        label: 'After lunch',
      };
    case 'AFTER_DINNER':
      return {
        icon: <Moon className="w-4 h-4 text-indigo-600" />,
        bg: 'bg-indigo-50 border-indigo-100',
        label: 'After dinner',
      };
    default:
      return {
        icon: <Clock className="w-4 h-4 text-slate-600" />,
        bg: 'bg-slate-50 border-slate-100',
        label: slot,
      };
  }
};

export const getGlucoseStatus = (value, slot) => {
  const isFasting = slot === 'MORNING';

  if (isFasting) {
    if (value < 70) {
      return {
        label: 'Low',
        color: 'bg-sky-50 text-sky-700 border-sky-200',
        type: 'low',
      };
    }
    if (value <= 99) {
      return {
        label: 'Normal',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        type: 'normal',
      };
    }
    if (value <= 125) {
      return {
        label: 'Medium',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        type: 'elevated',
      };
    }
    return {
      label: 'High',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      type: 'high',
    };
  } else {
    if (value < 70) {
      return {
        label: 'Low',
        color: 'bg-sky-50 text-sky-700 border-sky-200',
        type: 'low',
      };
    }
    if (value <= 139) {
      return {
        label: 'Normal',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        type: 'normal',
      };
    }
    if (value <= 199) {
      return {
        label: 'Medium',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        type: 'elevated',
      };
    }
    return {
      label: 'High',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      type: 'high',
    };
  }
};

