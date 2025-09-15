// 格式化工具函数

// 格式化字节数为人类可读格式
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// 格式化百分比
export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// 格式化频率 (MHz)
export const formatFrequency = (mhz: number): string => {
  if (mhz >= 1000) {
    return `${(mhz / 1000).toFixed(2)} GHz`;
  }
  return `${mhz.toFixed(0)} MHz`;
};

// 格式化温度
export const formatTemperature = (celsius: number): string => {
  return `${celsius.toFixed(1)}°C`;
};

// 格式化运行时间
export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
};

// 格式化时间戳为相对时间
export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}天前`;
  } else if (diffHours > 0) {
    return `${diffHours}小时前`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分钟前`;
  } else {
    return `${diffSeconds}秒前`;
  }
};

// 格式化网络速度
export const formatNetworkSpeed = (bytesPerSecond: number): string => {
  const bitsPerSecond = bytesPerSecond * 8;

  if (bitsPerSecond >= 1000000000) {
    return `${(bitsPerSecond / 1000000000).toFixed(2)} Gbps`;
  } else if (bitsPerSecond >= 1000000) {
    return `${(bitsPerSecond / 1000000).toFixed(2)} Mbps`;
  } else if (bitsPerSecond >= 1000) {
    return `${(bitsPerSecond / 1000).toFixed(2)} Kbps`;
  } else {
    return `${bitsPerSecond.toFixed(0)} bps`;
  }
};

// 获取状态颜色
export const getStatusColor = (
  value: number,
  thresholds: { warning: number; danger: number }
) => {
  if (value >= thresholds.danger) {
    return "text-red-500";
  } else if (value >= thresholds.warning) {
    return "text-yellow-500";
  } else {
    return "text-green-500";
  }
};

// 获取进度条颜色
export const getProgressColor = (
  value: number,
  thresholds: { warning: number; danger: number }
) => {
  if (value >= thresholds.danger) {
    return "bg-red-500";
  } else if (value >= thresholds.warning) {
    return "bg-yellow-500";
  } else {
    return "bg-green-500";
  }
};
