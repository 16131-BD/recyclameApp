import { Connection } from "mongoose";
import { Request } from '../schemas/request.schema';

export const RequestProvider = [
  {
    provide: 'REQUEST_MODEL',
    useFactory: (connection: Connection) => connection.model('requests', Request),
    inject: ['DATABASE_CONNECTION']
  }
];