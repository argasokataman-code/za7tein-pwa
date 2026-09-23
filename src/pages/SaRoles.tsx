import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { SuperAdminShell } from '../components/layout/SuperAdminShell'
import { operatorStatusLabel, roleForOperator, saPermissions } from '../data/superadmin'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import {
  addOperator,
  setCsActor,
  setOperatorStatus,
  togglePermission,
} from '../store/slices/superAdminSlice'

const GROUPS = [
  { id: 'platform', label: 'Platform (khusus SA)' },
  { id: 'operasi', label: 'Operasi harian (panel CS)' },
] as const

/**
 * Role, permission, dan operator.
 *
 * Dua aturan yang menentukan bentuk layar: (1) role pemilik platform tidak bisa
 * diubah dari UI, kalau bisa, satu klik salah mengunci seluruh konsol; (2) akun
 * operator CS dibuat SA (OQ-30, PO 2026-09-23), jadi form "buat operator" ada di
 * sini, bukan di panel CS.
 */
export default function SaRoles() {
  const dispatch = useAppDispatch()
  const roles = useAppSelector((s) => s.superAdmin.roles)
  const operators = useAppSelector((s) => s.superAdmin.operators)
  const csActorId = useAppSelector((s) => s.superAdmin.csActorId)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [roleId, setRoleId] = useState('cs_agent')

  const canSubmit = name.trim().length > 1 && contact.trim().length > 3

  return (
    <SuperAdminShell>
      <section className="sa-card">
        <p className="sa-card-label">Role & permission</p>
        <p className="sa-card-sub">
          Izin dikelompokkan jadi dua: konfigurasi platform (hanya SA) dan operasi harian (dipakai
          panel CS). Role pemilik platform dikunci supaya konsol tidak bisa mengunci dirinya
          sendiri.
        </p>

        <div className="sa-role-grid">
          {roles.map((role) => (
            <article key={role.id} className="sa-role">
              <div className="sa-card-head">
                <div>
                  <p className="sa-card-title">{role.name}</p>
                  <p className="sa-card-sub">
                    {role.scope === 'sa' ? 'Konsol SA' : 'Panel CS'} · {role.permissionIds.length} izin
                  </p>
                </div>
                {role.locked ? <span className="sa-chip">Terkunci</span> : null}
              </div>

              {GROUPS.map((group) => (
                <div key={group.id} className="sa-perm-group">
                  <p className="sa-perm-group-title">{group.label}</p>
                  <ul className="sa-perm-list">
                    {saPermissions
                      .filter((permission) => permission.group === group.id)
                      .map((permission) => {
                        const checked = role.permissionIds.includes(permission.id)
                        return (
                          <li key={permission.id}>
                            <label className="sa-perm">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={role.locked}
                                onChange={() =>
                                  dispatch(
                                    togglePermission({ roleId: role.id, permissionId: permission.id }),
                                  )
                                }
                              />
                              <span>{permission.label}</span>
                            </label>
                          </li>
                        )
                      })}
                  </ul>
                </div>
              ))}

              {role.locked ? (
                <p className="sa-note">Izin role ini tidak bisa diubah dari UI.</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="sa-card">
        <p className="sa-card-label">Operator</p>
        <p className="sa-card-sub">
          Akun operator dibuat SA (OQ-30). Operator CS memakai panel <code className="sa-code">/admin</code>;
          operator SA memakai konsol ini.
        </p>

        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th scope="col">Nama</th>
                <th scope="col">Kontak</th>
                <th scope="col">Role</th>
                <th scope="col">Dibuat</th>
                <th scope="col">Status</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {operators.map((operator) => {
                const role = roleForOperator(roles, operator)
                return (
                  <tr key={operator.id}>
                    <td>{operator.name}</td>
                    <td>{operator.contact}</td>
                    <td>{role?.name ?? 'Tidak diketahui'}</td>
                    <td>{operator.createdAt}</td>
                    <td>
                      <span className={`sa-chip${operator.status === 'active' ? ' is-ok' : operator.status === 'suspended' ? ' is-off' : ''}`}>
                        {operatorStatusLabel[operator.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="sa-btn sa-btn--small"
                        disabled={role?.locked === true}
                        onClick={() => {
                          const next = operator.status === 'active' ? 'suspended' : 'active'
                          dispatch(setOperatorStatus({ id: operator.id, status: next }))
                          toast.success(
                            next === 'active'
                              ? `${operator.name} diaktifkan`
                              : `${operator.name} dinonaktifkan`,
                          )
                        }}
                      >
                        {operator.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="sa-form">
          <p className="sa-perm-group-title">Operator CS yang sedang bertugas</p>
          <p className="sa-card-sub">
            Aksi panel CS tercatat di audit trail atas nama operator ini. Di produksi ini datang
            dari sesi CS; repo ini tanpa auth, jadi ditetapkan dari sini.
          </p>
          <label className="sa-field sa-field--inline">
            <span>Bertugas sebagai</span>
            <select value={csActorId} onChange={(e) => dispatch(setCsActor({ id: e.target.value }))}>
              {operators
                .filter((operator) => roleForOperator(roles, operator)?.scope === 'cs')
                .map((operator) => (
                  <option key={operator.id} value={operator.id}>
                    {operator.name} · {roleForOperator(roles, operator)?.name}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <form
          className="sa-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (!canSubmit) return
            dispatch(addOperator({ name: name.trim(), contact: contact.trim(), roleId }))
            toast.success(`Undangan dikirim ke ${name.trim()}`)
            setName('')
            setContact('')
          }}
        >
          <p className="sa-perm-group-title">Buat operator baru</p>
          <div className="sa-form-grid">
            <label className="sa-field">
              <span>Nama</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="mis. Lina Haddad"
                required
              />
            </label>
            <label className="sa-field">
              <span>Kontak</span>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="nama@sa7tein.app"
                required
              />
            </label>
            <label className="sa-field">
              <span>Role</span>
              <select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="sa-btn sa-btn--primary" disabled={!canSubmit}>
              <UserPlus size={16} strokeWidth={1.75} aria-hidden="true" />
              Buat operator
            </button>
          </div>
          <p className="sa-note">
            Operator baru dibuat berstatus <em>Diundang</em> sampai dia masuk pertama kali.
          </p>
        </form>
      </section>
    </SuperAdminShell>
  )
}
