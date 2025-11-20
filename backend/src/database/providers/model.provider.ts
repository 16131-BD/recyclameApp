// database/model.providers.ts
import { Affiliation } from '../schemas/affiliation.schema';
import { MobileDevice } from '../schemas/mobile-device.schema';
import { Request } from '../schemas/request.schema';

export const ModelProviders = [
  {
    provide: 'AFFILIATION_MODEL',
    useFactory: (connection: any) => connection.model('affiliations', Affiliation),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'MOBILE_DEVICE_MODEL',
    useFactory: (connection: any) => connection.model('mobile_devices', MobileDevice),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'REQUEST_MODEL',
    useFactory: (connection: any) => connection.model('requests', Request),
    inject: ['DATABASE_CONNECTION'],
  },
];