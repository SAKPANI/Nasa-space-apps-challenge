type FlatMapProps = {
  from: string
  to: string
  mix: number
  alt: string
  lat: number | null
  lon: number | null
  onPick: (lat: number, lon: number) => void
}

export function FlatMap({ from, to, mix, alt, lat, lon, onPick }: FlatMapProps) {
  return (
    <div
      className="flat-map"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const u = (event.clientX - rect.left) / rect.width
        const vFromTop = (event.clientY - rect.top) / rect.height
        onPick((1 - vFromTop) * 180 - 90, u * 360 - 180)
      }}
    >
      <img src={from} alt={alt} style={{ opacity: 1 - mix }} />
      <img src={to} alt="" style={{ opacity: mix }} />
      {lat !== null && lon !== null ? (
        <span
          className="pin"
          style={{ left: `${((lon + 180) / 360) * 100}%`, top: `${((90 - lat) / 180) * 100}%` }}
        />
      ) : null}
    </div>
  )
}
