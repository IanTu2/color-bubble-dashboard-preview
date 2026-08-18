import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
try {
  const status = await server.ssrLoadModule('/src/curriculum-v20-review-status.ts')
  const internalReady = Array.from(status.V20_INTERNAL_READY_UNITS ?? [])
  const humanVerified = Array.from(status.V20_HUMAN_VERIFIED_UNITS ?? [])
  console.log('[curriculum-v20-status] explicit allow-list snapshot')
  console.log(JSON.stringify({ internalReady, humanVerified }, null, 2))
  if (internalReady.length !== 0 || humanVerified.length !== 0) {
    console.error('[curriculum-v20-status] FAILED: no unit may be promoted while current all-unit V20 review has unresolved P1 findings')
    process.exitCode = 1
  } else {
    console.log('[curriculum-v20-status] PASSED: 0/453 units are claimed V20-ready; all remain v20-reviewing.')
  }
} finally {
  await server.close()
}
