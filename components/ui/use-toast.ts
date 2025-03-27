// 简单的toast通知接口
export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

// 简易版toast函数，实际项目中可以使用更完整的toast库如react-hot-toast或sonner
export const toast = ({ title, description, variant = 'default' }: ToastProps) => {
  console.log(`[${variant.toUpperCase()}] ${title}: ${description}`);
  
  // 这里只做简单的控制台打印，实际项目中应实现完整的UI通知
  if (typeof window !== 'undefined') {
    alert(`${title}\n${description}`);
  }
}; 