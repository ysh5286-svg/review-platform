"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (opts: Record<string, unknown>) => unknown;
        Position: { TOP_RIGHT: unknown };
        Service: {
          geocode: (opts: { query: string; callback: (status: number, response: { v2: { addresses: { x: string; y: string }[] } }) => void }) => void;
          Status: { OK: number };
        };
      };
    };
  }
}

interface NaverMapProps {
  address: string;
  className?: string;
}

export default function NaverMap({ address, className = "" }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
    if (!clientId) {
      setError(true);
      return;
    }

    // 스크립트가 이미 로드되었는지 확인
    const existingScript = document.querySelector(`script[src*="openapi.map.naver.com"]`);

    function initMap() {
      if (!mapRef.current || !window.naver) return;

      // 기본 위치 (서울 시청)
      const defaultLat = 37.5666805;
      const defaultLng = 126.9784147;

      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(defaultLat, defaultLng),
        zoom: 16,
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT,
        },
        mapDataControl: false,
      });

      // 주소로 좌표 검색 (Geocoding)
      if (window.naver.maps.Service) {
        window.naver.maps.Service.geocode(
          {
            query: address,
            callback: (status, response) => {
              if (status === window.naver.maps.Service.Status.OK) {
                const result = response.v2.addresses[0];
                if (result) {
                  const point = new window.naver.maps.LatLng(
                    parseFloat(result.y),
                    parseFloat(result.x)
                  );
                  (map as { setCenter: (p: unknown) => void }).setCenter(point);
                  new window.naver.maps.Marker({
                    position: point,
                    map: map,
                  });
                }
              }
            },
          }
        );
      }
    }

    if (existingScript && window.naver) {
      initMap();
    } else if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&submodules=geocoder`;
      script.async = true;
      script.onload = () => initMap();
      script.onerror = () => setError(true);
      document.head.appendChild(script);
    } else {
      // 스크립트 존재하지만 아직 로드 안됨
      existingScript.addEventListener("load", initMap);
    }
  }, [address]);

  if (error) {
    // 폴백: 카카오맵 iframe
    return (
      <div className={`rounded-xl overflow-hidden border bg-gray-100 ${className}`} style={{ aspectRatio: "4/3", maxHeight: 320 }}>
        <iframe
          src={`https://map.kakao.com/?q=${encodeURIComponent(address)}`}
          className="w-full h-full border-0"
          loading="lazy"
          title="지도"
        />
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`rounded-xl overflow-hidden border bg-gray-100 ${className}`}
      style={{ aspectRatio: "4/3", maxHeight: 320 }}
    />
  );
}
