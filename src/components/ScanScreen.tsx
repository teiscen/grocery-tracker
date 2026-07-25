import { useNavigate } from 'react-router-dom'

export function ScanScreen() {
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '1rem', minHeight: '100dvh' }}>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h1 style={{ marginTop: '1rem' }}>Scan receipt</h1>
      <p>Scan flow is not wired to the backend yet.</p>
    </div>
  )
}
