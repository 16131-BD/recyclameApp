// Mapeo de funciones (el mismo que tenías)
const functions = {
  'postgres': {
    'POST': {
      'people/by': 'fx_sel_people',
      'people/create': 'fx_ins_people',
      // ... resto de tus mappings
    },
    // ... resto de tu configuración
  },
  'mongo': {
    // ... tu configuración de mongo
  }
};

interface DataSource {
  type: 'postgres' | 'mongo';
  identifier: string;
}

export const getDataSource = (method: string, url: string): DataSource | null => {
  if (functions.postgres[method as keyof typeof functions.postgres] && 
      (functions.postgres[method as keyof typeof functions.postgres] as any)[url]) {
    return { 
      type: 'postgres', 
      identifier: (functions.postgres[method as keyof typeof functions.postgres] as any)[url] 
    };
  }
  if (functions.mongo[method as keyof typeof functions.mongo] && 
      (functions.mongo[method as keyof typeof functions.mongo] as any)[url]) {
    return { 
      type: 'mongo', 
      identifier: (functions.mongo[method as keyof typeof functions.mongo] as any)[url] 
    };
  }
  return null;
};