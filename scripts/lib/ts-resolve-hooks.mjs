// Hook resolve: izinkan impor tanpa ekstensi seperti di sumber TS.
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context)
  } catch (err) {
    if (specifier.startsWith('.')) {
      for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
        try {
          return await next(specifier + ext, context)
        } catch {
          // coba ekstensi berikutnya
        }
      }
    }
    throw err
  }
}

/**
 * Hook load: `import.meta.env.*` diganti Vite saat build, jadi di Node nilainya
 * `undefined` dan modul yang membacanya (mis. `src/api/supabase.ts`) langsung
 * crash. Ganti dengan objek kosong supaya self-check yang menyeret modul `api/`
 * tetap bisa jalan; variabel env-nya memang tak perlu untuk logika murni.
 */
export async function load(url, context, next) {
  const result = await next(url, context)
  if (typeof result.source !== 'string' && !(result.source instanceof Uint8Array)) return result
  const source = typeof result.source === 'string' ? result.source : Buffer.from(result.source).toString('utf8')
  if (!source.includes('import.meta.env')) return result
  return { ...result, source: source.replaceAll('import.meta.env', '(globalThis.__checkEnv ??= {})') }
}
