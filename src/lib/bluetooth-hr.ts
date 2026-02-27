const HR_SERVICE_UUID = 0x180D;
const HR_MEASUREMENT_UUID = 0x2A37;

export type HRCallback = (bpm: number) => void;
export type DisconnectCallback = () => void;

export interface BLEHeartRateConnection {
  device: BluetoothDevice;
  disconnect: () => void;
}

export function isWebBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

function parseHeartRate(value: DataView): number {
  const flags = value.getUint8(0);
  const is16Bit = flags & 0x01;
  return is16Bit ? value.getUint16(1, true) : value.getUint8(1);
}

export async function connectHeartRateMonitor(
  onHeartRate: HRCallback,
  onDisconnect: DisconnectCallback,
): Promise<BLEHeartRateConnection> {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [HR_SERVICE_UUID] }],
  });

  const server = await device.gatt!.connect();
  const service = await server.getPrimaryService(HR_SERVICE_UUID);
  const characteristic = await service.getCharacteristic(HR_MEASUREMENT_UUID);

  characteristic.addEventListener('characteristicvaluechanged', (event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value!;
    onHeartRate(parseHeartRate(value));
  });

  await characteristic.startNotifications();

  const handleDisconnect = () => {
    device.removeEventListener('gattserverdisconnected', handleDisconnect);
    onDisconnect();
  };
  device.addEventListener('gattserverdisconnected', handleDisconnect);

  return {
    device,
    disconnect: () => {
      device.removeEventListener('gattserverdisconnected', handleDisconnect);
      device.gatt?.disconnect();
      onDisconnect();
    },
  };
}
