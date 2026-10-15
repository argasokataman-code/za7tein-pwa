// Bootstrap loader untuk self-check Node: daftarkan hook resolve tanpa ekstensi.
// Dipakai via: node --import ./scripts/lib/ts-resolve.mjs <check>.mjs
// ponytail: cukup resolve ekstensi; Node 24 menangani stripping tipe saat runtime.
import { register } from 'node:module'

register('./ts-resolve-hooks.mjs', import.meta.url)
