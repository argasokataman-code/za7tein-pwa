/**
 * Sinkron panel ops/CS dari BE — mock dulu, API menimpa:
 * `dispute_rules` (+ template punishment), `punishments`, `enterprise_ledger`.
 * Dipanggil dari `ApiSync` di `App` bersama `useApiSync`.
 */
import { fetchEnterpriseLedger } from '../api/admin'
import { fetchDisputeRules, fetchPenalties } from '../api/ops'
import { setLedger } from '../store/slices/adminSlice'
import { hydrateDisputeCatalog, hydratePenalties } from '../store/slices/opsSlice'
import { useSyncOnce } from './useApiReference'

export function useApiOps(): void {
  useSyncOnce(
    () => fetchDisputeRules(),
    (data, d) => d(hydrateDisputeCatalog(data)),
  )
  useSyncOnce(() => fetchPenalties(), (rows, d) => {
    if (rows.length) d(hydratePenalties(rows))
  })
  useSyncOnce(() => fetchEnterpriseLedger(), (rows, d) => {
    if (rows.length) d(setLedger(rows))
  })
}
