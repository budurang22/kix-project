import { useContext } from 'react';
import { SampleAdminContext } from '../features/admin/sample-admin-context.js';
export const useSampleAdmin = () => useContext(SampleAdminContext);
