'use client';

import React from 'react';
import {
  IconBell,
  IconChartBar,
  IconCheck,
  IconDashboard,
  IconDeviceDesktopAnalytics,
  IconFileText,
  IconHome,
  IconMail,
  IconReport,
  IconRobot,
  IconSearch,
  IconSettings,
  IconUser,
  IconUserCog,
  IconUsers,
  IconX,
  Icon as TablerIcon,
} from '@tabler/icons-react';

// Create a mapping of icon names to components
const iconMap: Record<string, TablerIcon> = {
  IconDeviceDesktopAnalytics,
  IconRobot,
  IconCheck,
  IconX,
  IconUser,
  IconUsers,
  IconHome,
  IconSettings,
  IconMail,
  IconBell,
  IconSearch,
  IconDashboard,
  IconFileText,
  IconChartBar,
  IconUserCog,
  IconReport,
};

interface DynamicIconProps {
  icon: string;
  size?: number;
  color?: string;
  stroke?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function DynamicTablerIcon({
  icon,
  size,
  color,
  stroke = 2,
  className,
  style,
}: DynamicIconProps) {
  const IconComponent = iconMap[icon];

  if (!IconComponent) {
    // eslint-disable-next-line no-console
    console.warn(`Icon "${icon}" not found in iconMap`);
    // Return a default icon or null
    return <IconX size={size} color="red" stroke={stroke} className={className} style={style} />;
  }

  return (
    <IconComponent size={size} color={color} stroke={stroke} className={className} style={style} />
  );
}
