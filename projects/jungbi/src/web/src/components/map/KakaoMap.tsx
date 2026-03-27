'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any
  }
}

export interface MapMarker {
  id: string
  name: string
  lat: number
  lng: number
  type: string
  stage: string
  district: string
  households: number
  area: string
}

interface KakaoMapProps {
  markers: MapMarker[]
  selectedDistrict: string | null
  onMarkerClick: (id: string) => void
  onDistrictChange: (district: string | null) => void
}

const TYPE_COLORS: Record<string, string> = {
  '재개발':    '#1D4ED8', // primary-700
  '재건축':    '#0891B2', // info-600
  '소규모정비': '#16A34A', // success-600
  '모아주택':  '#CA8A04', // warning-600
}

const DISTRICT_COORDS: Record<string, [number, number]> = {
  '도봉구':   [37.6688, 127.0471],
  '노원구':   [37.6542, 127.0568],
  '강북구':   [37.6396, 127.0253],
  '성북구':   [37.5894, 127.0167],
  '중랑구':   [37.6063, 127.0925],
  '동대문구': [37.5744, 127.0394],
  '광진구':   [37.5385, 127.0823],
  '성동구':   [37.5634, 127.0369],
  '종로구':   [37.5735, 126.9790],
  '중구':     [37.5636, 126.9976],
  '용산구':   [37.5324, 126.9908],
  '강남구':   [37.5172, 127.0473],
  '서초구':   [37.4837, 127.0324],
  '송파구':   [37.5145, 127.1060],
  '강동구':   [37.5301, 127.1238],
  '마포구':   [37.5663, 126.9014],
  '서대문구': [37.5791, 126.9368],
  '은평구':   [37.6027, 126.9291],
  '양천구':   [37.5170, 126.8665],
  '강서구':   [37.5510, 126.8495],
  '구로구':   [37.4954, 126.8875],
  '금천구':   [37.4519, 126.9020],
  '영등포구': [37.5264, 126.8963],
  '동작구':   [37.5124, 126.9394],
  '관악구':   [37.4784, 126.9516],
}

export function KakaoMap({
  markers,
  selectedDistrict,
  onMarkerClick,
  onDistrictChange,
}: KakaoMapProps) {
  const mapRef         = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerOverlaysRef = useRef<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infoOverlaysRef   = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // ── Initialize map ──────────────────────────────────────────────────────────

  useEffect(() => {
    function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return

      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 8,
      }

      const map = new window.kakao.maps.Map(mapRef.current, options)
      mapInstanceRef.current = map

      const zoomControl = new window.kakao.maps.ZoomControl()
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)

      const mapTypeControl = new window.kakao.maps.MapTypeControl()
      map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT)

      // Close info overlays when clicking bare map
      window.kakao.maps.event.addListener(map, 'click', () => {
        closeInfoOverlays()
      })

      setIsLoaded(true)
    }

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap)
      return
    }

    // SDK not ready yet — poll until it appears (it loads async via <script>)
    const timer = setInterval(() => {
      if (window.kakao && window.kakao.maps) {
        clearInterval(timer)
        window.kakao.maps.load(initMap)
      }
    }, 100)

    return () => clearInterval(timer)
  // run once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function closeInfoOverlays() {
    infoOverlaysRef.current.forEach(o => o.setMap(null))
    infoOverlaysRef.current = []
  }

  // ── Render markers whenever data or load state changes ──────────────────────

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    const map = mapInstanceRef.current

    // Clear previous markers
    markerOverlaysRef.current.forEach(o => o.setMap(null))
    markerOverlaysRef.current = []
    closeInfoOverlays()

    markers.forEach(item => {
      const position = new window.kakao.maps.LatLng(item.lat, item.lng)
      const color    = TYPE_COLORS[item.type] ?? '#1D4ED8'

      // ── Marker pill ────────────────────────────────────────────────────────

      const wrapper = document.createElement('div')
      wrapper.style.cssText = 'cursor:pointer;position:relative;'

      const pill = document.createElement('div')
      pill.style.cssText = `
        background:${color};
        color:#fff;
        padding:5px 10px;
        border-radius:20px;
        font-size:11px;
        font-weight:700;
        white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        border:2px solid #fff;
        text-align:center;
        min-width:60px;
        line-height:1.3;
        font-family:'Pretendard',sans-serif;
      `
      pill.textContent = item.name

      const arrow = document.createElement('div')
      arrow.style.cssText = `
        width:0;height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:8px solid ${color};
        margin:0 auto;
      `

      wrapper.appendChild(pill)
      wrapper.appendChild(arrow)

      // ── Info popup content ─────────────────────────────────────────────────

      function buildInfoContent() {
        const el = document.createElement('div')
        el.style.cssText = `
          background:#fff;
          border-radius:12px;
          padding:16px;
          box-shadow:0 4px 20px rgba(0,0,0,0.18);
          min-width:220px;
          max-width:280px;
          font-family:'Pretendard',sans-serif;
          position:relative;
        `

        const closeBtn = document.createElement('button')
        closeBtn.type = 'button'
        closeBtn.setAttribute('aria-label', '닫기')
        closeBtn.style.cssText = `
          position:absolute;top:10px;right:10px;
          background:none;border:none;cursor:pointer;
          color:#9CA3AF;font-size:14px;line-height:1;padding:2px;
        `
        closeBtn.textContent = '✕'
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          closeInfoOverlays()
        })

        el.innerHTML = `
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
            <span style="background:${color};color:#fff;font-size:10px;padding:2px 8px;border-radius:10px;font-weight:700;">${item.type}</span>
            <span style="background:#F3F4F6;color:#4B5563;font-size:10px;padding:2px 8px;border-radius:10px;font-weight:500;">${item.stage}</span>
          </div>
          <div style="font-size:14px;font-weight:700;color:#1F2937;margin-bottom:6px;">${item.name}</div>
          <div style="font-size:12px;color:#6B7280;line-height:1.6;">
            <div>${item.district} · ${item.area}</div>
            <div>${item.households.toLocaleString()}세대</div>
          </div>
        `
        el.appendChild(closeBtn)
        return el
      }

      // ── Click handler ──────────────────────────────────────────────────────

      wrapper.addEventListener('click', (e) => {
        e.stopPropagation()
        onMarkerClick(item.id)

        closeInfoOverlays()

        const infoOverlay = new window.kakao.maps.CustomOverlay({
          content:  buildInfoContent(),
          position: position,
          yAnchor:  1.45,
        })
        infoOverlay.setMap(map)
        infoOverlaysRef.current.push(infoOverlay)
      })

      // ── Hover scale ────────────────────────────────────────────────────────

      wrapper.addEventListener('mouseenter', () => {
        pill.style.transform = 'scale(1.08)'
        pill.style.transition = 'transform 0.15s ease'
      })
      wrapper.addEventListener('mouseleave', () => {
        pill.style.transform = 'scale(1)'
      })

      const overlay = new window.kakao.maps.CustomOverlay({
        content:  wrapper,
        position: position,
        yAnchor:  1.3,
      })
      overlay.setMap(map)
      markerOverlaysRef.current.push(overlay)
    })
  // onMarkerClick is stable from parent; include markers + isLoaded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, isLoaded])

  // ── Pan to district when filter changes ─────────────────────────────────────

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !selectedDistrict) return

    const coord = DISTRICT_COORDS[selectedDistrict]
    if (!coord) return

    const moveLatLng = new window.kakao.maps.LatLng(coord[0], coord[1])
    mapInstanceRef.current.panTo(moveLatLng)
    mapInstanceRef.current.setLevel(7)
  }, [selectedDistrict, isLoaded])

  // ── Reset view when district is cleared ─────────────────────────────────────

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || selectedDistrict !== null) return

    const center = new window.kakao.maps.LatLng(37.5665, 126.9780)
    mapInstanceRef.current.panTo(center)
    mapInstanceRef.current.setLevel(8)
  }, [selectedDistrict, isLoaded])

  // ── Suppress unused param warning (onDistrictChange reserved for future use)

  void onDistrictChange

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-neutral-200">
      <div
        ref={mapRef}
        style={{ width: '100%', height: 520 }}
        aria-label="서울시 정비구역 카카오맵"
        role="application"
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
          <div className="text-center">
            <div
              className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"
              aria-hidden
            />
            <p className="text-sm text-neutral-500">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  )
}
