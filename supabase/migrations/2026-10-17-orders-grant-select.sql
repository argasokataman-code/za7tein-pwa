-- orders: semua tabel lain (customers, menus, order_items, addresses) punya
-- GRANT SELECT untuk anon/authenticated; `orders` tertinggal → PostgREST
-- `Prefer: return=representation` saat checkout gagal 403 "permission denied
-- for table orders" (hint: GRANT SELECT). RLS (`orders_participant`,
-- `orders_ops`) tetap membatasi baris, jadi grant ini tidak membocorkan data.
grant select on public.orders to anon, authenticated;
