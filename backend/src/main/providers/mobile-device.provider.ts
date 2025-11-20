import { Connection } from "mongoose";
import { MobileDevice } from '../schemas/mobile-device.schema';

export const MobileDeviceProvider = [
  {
    provide: 'MOBILE_DEVICE_MODEL',
    useFactory: (connection: Connection) => connection.model('mobile_devices', MobileDevice),
    inject: ['DATABASE_CONNECTION']
  }
];