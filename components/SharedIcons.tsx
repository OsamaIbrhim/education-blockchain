import { Icon, IconProps } from '@chakra-ui/react';
import {
  FiUser,
  FiShield,
  FiDatabase,
  FiActivity,
  FiBook,
  FiCalendar,
  FiAward,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiBriefcase,
  FiSearch,
  FiDownload,
  FiClock
} from 'react-icons/fi';

export const IconComponent = ({ icon, ...props }: { icon: any } & IconProps) => (
  <Icon as={icon} {...props} />
);

export const UserIcon = (props: IconProps) => <IconComponent icon={FiUser} {...props} />;
export const ShieldIcon = (props: IconProps) => <IconComponent icon={FiShield} {...props} />;
export const DatabaseIcon = (props: IconProps) => <IconComponent icon={FiDatabase} {...props} />;
export const ActivityIcon = (props: IconProps) => <IconComponent icon={FiActivity} {...props} />;
export const BookIcon = (props: IconProps) => <IconComponent icon={FiBook} {...props} />;
export const CalendarIcon = (props: IconProps) => <IconComponent icon={FiCalendar} {...props} />;
export const AwardIcon = (props: IconProps) => <IconComponent icon={FiAward} {...props} />;
export const CheckCircleIcon = (props: IconProps) => <IconComponent icon={FiCheckCircle} {...props} />;
export const AlertCircleIcon = (props: IconProps) => <IconComponent icon={FiAlertCircle} {...props} />;
export const InfoIcon = (props: IconProps) => <IconComponent icon={FiInfo} {...props} />;
export const BriefcaseIcon = (props: IconProps) => <IconComponent icon={FiBriefcase} {...props} />;
export const SearchIcon = (props: IconProps) => <IconComponent icon={FiSearch} {...props} />;
export const DownloadIcon = (props: IconProps) => <IconComponent icon={FiDownload} {...props} />;
export const ClockIcon = (props: IconProps) => <IconComponent icon={FiClock} {...props} />; 