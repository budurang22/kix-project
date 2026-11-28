import { useContext } from 'react';
import { SampleCommerceContext } from '../features/orders/sample-commerce-context.js';
export const useSampleCommerce = () => useContext(SampleCommerceContext);
