import { Check, TriangleAlert } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'
import { useRef, useState, type ChangeEvent } from 'react'

import { mockUser } from '../data/user'
import { ensureCustomerToken } from '../api/orders'
import { imageFileError, uploadImage } from '../lib/image'

import toast from 'react-hot-toast'
import { BackButton } from '../components/ui/BackButton'

export default function AddProfilePhoto() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(mockUser.avatar)

  // Unggah ke R2 (URL publik). Kalau backend bukan Worker / R2 gagal, pakai
  // object URL lokal supaya pratinjau tetap ada (mock-first). Penyimpanan ke
  // `users.avatar` belum ada endpoint-nya (Worker /auth/me read-only).
  const onPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const error = imageFileError(file)
    if (error) {
      toast.error(error)
      return
    }
    try {
      setPreview(await uploadImage('avatars', 'user', file, await ensureCustomerToken()))
      toast.success('Foto diunggah ke R2')
    } catch {
      setPreview(URL.createObjectURL(file))
    }
  }

  return (
    <>
    <div className="app-shell">
      <main>
        <div className="profile-flow-page">
          <div className="profile-flow">
            <header className="profile-flow-header">
              <BackButton className="btn-back" />
              <h1 className="profile-flow-title">
                Add Profile Photo
              </h1>
            </header>
            <main className="profile-flow-main">
              <div className="add-photo-block">
                <div className="add-photo-avatar">
                  <img id="profilePhotoPreview" alt="Profile" width={52} height={52} src={preview} style={{ color: "transparent" }} />
                </div>
                <button type="button" className="btn-upload-photo" onClick={() => fileRef.current?.click()}>
                  Upload New Photo
                </button>
                <input accept="image/*" className="d-none" type="file" ref={fileRef} onChange={(event) => void onPick(event)} />
              </div>
              <button type="button" className="btn-profile-primary" onClick={() => { toast.success("Changes saved!"); navigate('/profile') }}>
                Save Changes
              </button>
            </main>
          </div>
          <div className="profile-modal-overlay " id="successModal">
            <div className="profile-modal">
              <div className="profile-modal-icon success-icon">
                <Check size={48} strokeWidth={1.75} />
              </div>
              <h2 className="profile-modal-title">
                Profile Update Successfully
              </h2>
              <p className="profile-modal-text">
                Congratulations! Your changes have been saved. Your profile is now up-to-date.
              </p>
              <button type="button" className="btn-profile-primary" onClick={() => { toast.success("Changes saved!"); navigate('/profile') }}>
                Done
              </button>
            </div>
          </div>
          <div className="profile-modal-overlay " id="exitModal">
            <div className="profile-modal">
              <div className="profile-modal-icon exit-icon">
                <TriangleAlert size={48} strokeWidth={1.75} />
              </div>
              <h2 className="profile-modal-title">
                Are you sure want to exit without saving your profile?
              </h2>
              <p className="profile-modal-text">
                If you exit now any changes you haven't saved will be lost.
              </p>
              <div className="profile-modal-actions">
                <button type="button" className="btn-profile-outline" onClick={() => { navigate(-1) }}>
                  Cancel
                </button>
                <button type="button" className="btn-profile-primary" onClick={() => { toast.success("Changes saved!"); navigate('/profile') }}>
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
