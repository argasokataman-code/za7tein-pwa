import { fetchPartnerBoard } from '../api/partner'
import { hydratePartnerBoard } from '../store/slices/partnerSlice'
import { useSyncOnce } from './useApiReference'

/** Board mitra (identitas, assignment, SP) — mock tetap dipakai kalau API gagal. */
export function useApiPartner(): void {
  useSyncOnce(
    () => fetchPartnerBoard(),
    (board, dispatch) => {
      if (board) dispatch(hydratePartnerBoard(board))
    },
  )
}
