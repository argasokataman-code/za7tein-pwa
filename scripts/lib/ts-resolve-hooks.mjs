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
