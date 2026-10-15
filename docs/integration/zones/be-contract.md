# Kontrak BE — Zona & coverage

Repo ini front-end (AGENTS.md §1). Dokumen ini mencatat jalur data zona/coverage
ke PostgREST Supabase. Master zona **milik Super Admin**, **dibaca semua peran**.

## 1. `GET /zones` — master zona

Tabel `zones`: `id`, `code`, `name`, `polygon` (`jsonb`, array `[lat,lng]`).
RLS:

| policy | cmd | siapa |
|---|---|---|
| `zones_public_read` | SELECT `using (true)` | semua peran (anon + authenticated) |
| `zones_ops` | ALL | `app_is_ops()` = peran `cs` / `superadmin` |

FE: `fetchZones()` (`src/api/reference.ts`) → `ZoneGeometry[]`; dipakai konsol SA
(`SaZones`) dan sebagai sumber poligon pratinjau. `row.polygon` `[[lat,lng],…]`
dikonversi ke `vertices` `{lat,lng}[]`.

## 2. `POST /rpc/resolve_coverage` — coverage titik (geofence)

Menentukan apakah sebuah titik bisa diantar **untuk merchant tertentu**. Ini
keputusan coverage yang sebenarnya; `resolveCoverage()` klien cuma poligon
global tanpa radius/toggle.

Argumen: `p_lat double precision, p_lng double precision, p_merchant_id bigint`.
Kembalian `jsonb`:
`{ covered, zone, distanceMeters, radiusMeters, merchant }`.

`covered` = titik di dalam poligon **dan** jarak ≤ `radiusMeters` **dan** zona
itu diaktifkan merchant (`is_active_hijazi` / `is_active_syimali`).

FE: `resolveAddressCoverage(lat, lng, merchantId)` (`src/api/profile.ts`) →
dipakai `useApiProfile` saat memuat alamat customer; `Address.zone` = `zone`
hanya bila `covered`, kalau tidak `null` (tidak bisa diantar).

`POST /coverage/resolve` (versi gateway) belum ada — tidak ada gateway REST
`api.sa7tein.app`; jalur nyata adalah RPC di atas.

### SQL (apply ulang bila project dibuat ulang)

Prasyarat: helper `public._point_in_poly(double precision, double precision, jsonb)`
dan `public._haversine_m(...)` sudah ada di BE.

```sql
create or replace function public.resolve_coverage(p_lat double precision, p_lng double precision, p_merchant_id bigint)
returns jsonb
language plpgsql
stable security definer
set search_path to 'public'
as $function$
declare
  z record; m record; dist double precision; radius integer := 2000; covered boolean := false; zone_code text;
begin
  select id, code, polygon into z from zones
    where public._point_in_poly(p_lat, p_lng, polygon) limit 1;
  select latitude, longitude, delivery_config, is_active_hijazi, is_active_syimali, store_name
    into m from merchants where id = p_merchant_id;
  if m is null then return jsonb_build_object('covered', false, 'reason', 'merchant_not_found'); end if;
  dist := public._haversine_m(p_lat, p_lng, m.latitude, m.longitude);
  radius := coalesce((m.delivery_config->>'radiusMeters')::int, 2000);
  zone_code := z.code;
  covered := z.id is not null and dist <= radius
    and ( (z.code ilike 'hijazi' and m.is_active_hijazi) or (z.code ilike 'syimali' and m.is_active_syimali) or (z.code not ilike 'hijazi' and z.code not ilike 'syimali') );
  return jsonb_build_object(
    'covered', covered, 'zone', to_jsonb(z.code), 'distanceMeters', round(dist), 'radiusMeters', radius,
    'merchant', m.store_name
  );
end $function$;
```

## 3. Tulis master zona (SA/ops)

`PATCH /zones?code=ilike.<code>` dengan `{ polygon: [[lat,lng],…] }`.
FE: `updateZonePolygon(id, vertices)` (`src/api/reference.ts`), dipanggil konsol SA
saat **Simpan poligon** dan **Kembalikan bentuk awal**. Token = `refToken()`
(akun `cs@` demo, peran `cs` → lolos `zones_ops`).

## 4. Catatan

- Pratinjau kanvas konsol SA (`resolveCoverage()` klien) tetap dipakai supaya pin
  yang digeser langsung berubah tanpa round-trip; angka otoritatif alamat
  tersimpan datang dari RPC.
- `merchants.delivery_config.radiusMeters` (default 2000) menentukan syarat
  jarak; demo merchant `id=1` = `Warung Sate Pak Ali`, radius 2000, dua zona aktif.
