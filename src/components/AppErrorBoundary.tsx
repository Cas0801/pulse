import { Component, type ErrorInfo, type ReactNode } from 'react';
import StateCard from './StateCard';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Pulse UI crashed', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-[460px]">
          <StateCard
            tone="error"
            eyebrow="页面异常"
            title="页面暂时无法显示"
            description="刚才的操作没有完成。你可以重新加载页面继续使用。"
            actionLabel="重新加载"
            onAction={this.handleReload}
          />
        </div>
      </div>
    );
  }
}
