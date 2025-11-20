import * as mongoose from 'mongoose';
import { DB_URL } from '../constants';

export const DatabaseProvider = [
    {
        provide: 'DATABASE_CONNECTION',
        useFactory: (): Promise<typeof mongoose> => mongoose.connect(DB_URL)
    }
]