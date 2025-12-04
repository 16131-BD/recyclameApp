// database/model.providers.ts
import { Affiliation } from '../schemas/affiliation.schema';
import { MobileDevice } from '../schemas/mobile-device.schema';
import { Request } from '../schemas/request.schema';
import { Residue } from '../schemas/residue.schema';
import { AuthorizedOperation } from '../schemas/authorized-operation.schema';
import { CompanyRequest } from '../schemas/company-request.schema';
import { AffiliationRequest } from '../schemas/affiliation-request.schema';
import { UserPermission } from '../schemas/user-permission.schema';
import { OperationType } from '../schemas/operation-type.schema';

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
  {
    provide: 'RESIDUE_MODEL',
    useFactory: (connection: any) => connection.model('residues', Residue),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'AUTHORIZED_OPERATION_MODEL',
    useFactory: (connection: any) => connection.model('authorized_operations', AuthorizedOperation),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'COMPANY_REQUEST_MODEL',
    useFactory: (connection: any) => connection.model('company_requests', CompanyRequest),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'AFFILIATION_REQUEST_MODEL',
    useFactory: (connection: any) => connection.model('affiliation_requests', AffiliationRequest),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'USER_PERMISSION_MODEL',
    useFactory: (connection: any) => connection.model('user_permissions', UserPermission),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'OPERATION_TYPE_MODEL',
    useFactory: (connection: any) => connection.model('operation_types', OperationType),
    inject: ['DATABASE_CONNECTION'],
  },
];