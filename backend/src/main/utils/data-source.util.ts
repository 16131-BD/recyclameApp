// Mapeo de funciones (el mismo que tenías)
const functions = {
  'postgres': {
    'POST': {
      'companies/by': 'fx_sel_companies',
      'companies/create': 'fx_ins_companies',
      'operations_details/by': 'fx_sel_operations_detail',
      'operations_details/create': 'fx_ins_operations_detail',
      'plants/by': 'fx_sel_plants',
      'plants/create': 'fx_ins_plants',
      'residues/by': 'fx_sel_residues',
      'residues/create': 'fx_ins_residues',
      'types/by': 'fx_sel_types',
      'types/create': 'fx_ins_types',
      'users/by': 'fx_sel_users',
      'users/create': 'fx_ins_users',
      // ... resto de tus mappings
    },
    'PUT': {
      'companies/update': 'fx_update_companies',
      'operations_detail/update': 'fx_update_operations_detail',
      'plants/update': 'fx_update_plants',
      'residues/update': 'fx_update_residues',
      'types/update': 'fx_update_types',
      'users/update': 'fx_update_users',
    }
    // ... resto de tu configuración
  },
  'mongo': {
    'POST': {
      'affiliations/by': 'affiliations',
      'affiliations/create': 'affiliations',
      'mobile_devices/by': 'mobile_devices',
      'mobile_devices/create': 'mobile_devices',
      'requests/by': 'requests',
      'requests/create': 'requests',
    },
    'PUT': {
      'affiliations/update': 'affiliations',
      'mobile_devices/update': 'mobile_devices',
      'requests/update': 'requests',
    }
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