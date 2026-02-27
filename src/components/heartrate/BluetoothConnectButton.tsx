import { Bluetooth, BluetoothOff, Loader2 } from 'lucide-react';

interface Props {
  connected: boolean;
  connecting: boolean;
  supported: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function BluetoothConnectButton({
  connected,
  connecting,
  supported,
  error,
  onConnect,
  onDisconnect,
}: Props) {
  if (!supported) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <BluetoothOff size={16} />
        <span>Bluetooth not supported</span>
      </div>
    );
  }

  if (connected) {
    return (
      <button
        onClick={onDisconnect}
        className="flex items-center gap-2 rounded-full bg-zone-target/20 px-4 py-2 text-sm font-medium text-zone-target active:scale-95 transition-transform"
      >
        <Bluetooth size={16} />
        HR Connected
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onConnect}
        disabled={connecting}
        className="flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 active:scale-95 transition-transform disabled:opacity-50"
      >
        {connecting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Bluetooth size={16} />
        )}
        {connecting ? 'Connecting...' : 'Connect HR Monitor'}
      </button>
      {error && (
        <span className="text-xs text-interval">{error}</span>
      )}
    </div>
  );
}
