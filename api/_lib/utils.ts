export function formatRelativeTime(dateInput: string): string {
  const now = new Date();
  const target = new Date(dateInput);
  const diffMinutes = Math.floor((now.getTime() - target.getTime()) / 60000);

  if (Number.isNaN(target.getTime())) {
    return '刚刚';
  }

  if (diffMinutes < 1) {
    return '刚刚';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} 小时前`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} 天前`;
  }

  return target.toLocaleDateString('zh-CN');
}
