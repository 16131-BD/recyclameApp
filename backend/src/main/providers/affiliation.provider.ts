import { Connection } from "mongoose";
import { Affiliation } from '../schemas/affiliation.schema';

export const AffiliationProvider = [
  {
    provide: 'AFFILIATION_MODEL',
    useFactory: (connection: Connection) => connection.model('affiliations', Affiliation),
    inject: ['DATABASE_CONNECTION']
  }
];