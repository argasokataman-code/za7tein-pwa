import { Heart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { FoodCard } from '../components/ui/FoodCard'
import { useAppSelector } from '../hooks/useAppStore'
import { useAllMenuItems } from '../hooks/useApiCatalog'
import { menuSeed } from '../data/catalog'
import type { MenuItem } from '../types'
import { BackButton } from '../components/ui/BackButton'

export default function Favorites() {
  const navigate = useNavigate()
  const ids = useAppSelector((s) => s.favorites.ids)
  // Id favorit berasal dari kartu menu live (BE), jadi resolusi pun live:
  // `menuSeed` cuma tampilan sementara sebelum API menjawab.
  const items = useAllMenuItems(menuSeed)
  const favorites = ids
    .map((id) => items.find((f) => f.id === id))
    .filter((f): f is MenuItem => Boolean(f))

  return (
    <>
      <div className="app-shell">
        <main>
          <div className="favorites-screen">
            <header className="favorites-header">
              <BackButton className="btn-back" />
              <h1 className="favorites-title">
                Favorites{favorites.length > 0 ? ` (${favorites.length})` : ''}
              </h1>
            </header>
            <div className="favorites-content">
              {favorites.length === 0 ? (
                <div className="empty-state">
                  <Heart size={80} strokeWidth={1.75} color="var(--orange-ink)" />
                  <h2>Belum ada favorit</h2>
                  <p>Tandai hidangan favoritmu untuk melihatnya di sini.</p>
                  <Link className="btn btn-primary" to="/home">
                    Jelajahi Menu
                  </Link>
                </div>
              ) : (
                // Kartu yang sama dengan Search dan halaman toko. Sebelumnya
                // kartu disusun ulang di sini sebagai <Link>, termasuk <button>
                // "Tambah" di dalam <a> — sarang yang tidak sah.
                <div className="favorites-grid" role="list">
                  {favorites.map((food) => (
                    <FoodCard
                      key={food.id}
                      food={food}
                      onOpen={(item) => navigate(`/menu-detail/${item.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
