import { Link, useParams } from 'react-router-dom'
import OpenSeadragonViewer from '../../slides/components/OpenSeadragonViewer'
import { getSharedDziUrl, getSharedTileUrl } from '../api'
import { useSharedSlideMeta } from '../hooks'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}

export default function SharedSlidePage() {
  const { token } = useParams()
  const metaQuery = useSharedSlideMeta(token)

  if (!token) {
    return <div className="p-8 text-sm text-red-700">Missing share token.</div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-sky-700">
              {metaQuery.data?.report_title || 'Shared slide'}
            </p>
            <h1 className="text-xl font-semibold text-slate-950">
              {metaQuery.data?.filename ?? 'Slide viewer'}
            </h1>
          </div>
          <Link
            to="/login"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {metaQuery.isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
            Loading shared slide...
          </div>
        )}

        {metaQuery.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-700">
            {getErrorMessage(metaQuery.error)}
          </div>
        )}

        {metaQuery.data && (
          <OpenSeadragonViewer
            dziUrl={getSharedDziUrl(token)}
            getTileUrl={(level, col, row) => getSharedTileUrl(token, level, col, row)}
            useAuth={false}
          />
        )}
      </main>
    </div>
  )
}
