import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import { useCurrentUser } from '../../auth/hooks'
import AppShell from '../../components/AppShell'
import { useReports } from '../../reports/hooks'
import { getSlideDziUrl, getSlideTileUrl } from '../api'
import OpenSeadragonViewer from '../components/OpenSeadragonViewer'
import { useSlides } from '../hooks'

function hasPermission(permissions: string[] | undefined, permission: string) {
  return permissions?.includes(permission) ?? false
}

export default function SlideViewerPage() {
  const { reportId, slideId } = useParams()
  const currentUserQuery = useCurrentUser()
  const currentUser = currentUserQuery.data
  const canView = currentUser?.is_admin || hasPermission(currentUser?.permissions, 'slides:view')
  const canViewReports =
    currentUser?.is_admin || hasPermission(currentUser?.permissions, 'reports:view')
  const reportsQuery = useReports(canView === true && canViewReports === true)
  const slidesQuery = useSlides(reportId, canView === true)

  const report = reportsQuery.data?.find((item) => item.id === reportId)
  const slide = slidesQuery.data?.find((item) => item.id === slideId)

  if (!reportId || !slideId) {
    return <div className="p-8 text-sm text-red-700">Missing slide route parameters.</div>
  }

  if (currentUserQuery.isLoading) {
    return (
      <AppShell title="Slide viewer" maxWidth="wide">
        <div className="clinical-card rounded-md p-8 text-sm text-slate-600">
          Checking slide access...
        </div>
      </AppShell>
    )
  }

  if (!canView) {
    return (
      <AppShell title="Slide viewer" maxWidth="wide">
        <div className="clinical-card rounded-md p-8">
          <h2 className="text-base font-semibold text-[#102a35]">Slides access required</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            You do not have permission to view this slide. Ask an organization admin to grant
            slides:view access.
          </p>
        </div>
      </AppShell>
    )
  }

  if (reportsQuery.isLoading || slidesQuery.isLoading) {
    return (
      <AppShell title="Slide viewer" maxWidth="wide">
        <div className="clinical-card rounded-md p-8 text-sm text-slate-600">Loading viewer...</div>
      </AppShell>
    )
  }

  return (
    <AppShell
      title={slide?.filename ?? 'Slide viewer'}
      eyebrow={report?.title ?? 'Report'}
      maxWidth="wide"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Link to={`/reports/${reportId}/slides`} className="clinical-button clinical-secondary">
            <ArrowLeft className="size-4" strokeWidth={2} />
            Back to slides
          </Link>
          <Link to="/reports" className="clinical-button clinical-secondary">
            <ClipboardList className="size-4" strokeWidth={2} />
            Reports
          </Link>
        </div>

        <OpenSeadragonViewer
          dziUrl={getSlideDziUrl(reportId, slideId)}
          getTileUrl={(level, col, row) => getSlideTileUrl(reportId, slideId, level, col, row)}
        />
      </div>
    </AppShell>
  )
}
