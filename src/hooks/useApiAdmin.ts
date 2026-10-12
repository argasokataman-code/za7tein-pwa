/** Sinkron data panel CS (risiko customer & blacklist COD) — mock dulu, API menimpa. */
import { fetchAdminCustomers, fetchCustomerRiskFlags } from '../api/admin'
import { setBeCustomers, setCustomerRiskFlags } from '../store/slices/adminSlice'
import { useSyncOnce } from './useApiReference'

/** Customer BE + riwayat flag risiko → picker/daftar blacklist COD panel CS. */
export function useAdminCustomers(): void {
  useSyncOnce(() => fetchAdminCustomers(), (rows, d) => {
    if (rows.length) d(setBeCustomers(rows))
  })
  useSyncOnce(() => fetchCustomerRiskFlags(), (rows, d) => {
    if (rows.length) d(setCustomerRiskFlags(rows))
  })
}
