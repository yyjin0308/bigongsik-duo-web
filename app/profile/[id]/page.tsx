
'use client';

import {
  use,
  useEffect,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { supabase, Profile, signProfilePhotos } from '../../../lib/supabase';

export default function Detail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [p, setP] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<number | null>(null);

  const touchStartX = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const client = supabase();
    let active = true;
    let version = 0;
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      const current = ++version;
      try {
        const { data: auth } = await client.auth.getUser();
        if (!auth.user) throw new Error('로그인이 필요합니다.');
        const { data, error } = await client.from('profiles').select('*').eq('id', id).eq('is_published', true).maybeSingle();
        if (error) throw error;
        const profile = data as Profile | null;
        const signed = profile ? { ...profile, photos: (await signProfilePhotos(client, profile.photos || [], !!profile.member_id)).filter(Boolean) } : null;
        if (active && current === version) { setP(signed); if (!signed) setActivePhoto(null); }
      } catch { if (active && current === version) { setP(null); setActivePhoto(null); } }
      finally { if (active && current === version) setLoading(false); }
    }
    const schedule = () => { ++version; setP(null); setActivePhoto(null); setLoading(true); clearTimeout(timer); timer = setTimeout(refresh, 0); };
    const { data: { subscription } } = client.auth.onAuthStateChange(event => { if (event !== 'TOKEN_REFRESHED') schedule(); });
    const onFocus = () => { if (document.visibilityState === 'visible') schedule(); };
    document.addEventListener('visibilitychange', onFocus);
    const renewal = setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 240000);
    schedule();
    return () => { active = false; clearTimeout(timer); clearInterval(renewal); subscription.unsubscribe(); document.removeEventListener('visibilitychange', onFocus); };
  }, [id]);

  const photos = p?.photos || [];
  const isViewerOpen = activePhoto !== null;

  const movePhoto = (direction: number) => {
    if (photos.length <= 1) return;

    setActivePhoto((current) => {
      if (current === null) return null;

      return (
        (current + direction + photos.length) %
        photos.length
      );
    });
  };

  useEffect(() => {
    if (!isViewerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActivePhoto(null);
      }

      if (event.key === 'ArrowRight') {
        movePhoto(1);
      }

      if (event.key === 'ArrowLeft') {
        movePhoto(-1);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isViewerOpen, photos.length]);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const distance =
      event.changedTouches[0].clientX -
      touchStartX.current;

    if (Math.abs(distance) > 50) {
      movePhoto(distance < 0 ? 1 : -1);
    }

    touchStartX.current = null;
  };

  return (
    <main className="wrap">
      <Link href="/" className="back">
        ← 프로필 목록으로
      </Link>

      {loading ? (
        <div className="empty">불러오는 중...</div>
      ) : !p ? (
        <div className="empty">
          공개된 프로필을 찾을 수 없습니다.
        </div>
      ) : (
        <div className="detail">
          <div className="photos">
            {photos.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                className="photo-zoom-button"
                onClick={() => setActivePhoto(index)}
                aria-label={`${p.display_name} 사진 ${index + 1} 확대`}
              >
                <img
                  src={src}
                  alt={`${p.display_name} 사진 ${index + 1}`}
                />
                <span className="photo-zoom-hint">
                  ⤢ 사진 확대
                </span>
              </button>
            ))}
          </div>

          <div>
            <div
              className="eyebrow"
              style={{ color: '#7a304b' }}
            >
              RED CRYSTAL PROFILE
            </div>

            <h1>{p.display_name}</h1>

            <p className="muted">
              {[
                p.birth_year
                  ? `${p.birth_year}년생`
                  : null,
                p.job,
                p.region,
                p.height_cm
                  ? `${p.height_cm}cm`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>

            {[
              ['자기소개', p.bio],
              ['취미와 관심사', p.hobbies],
              ['이상형', p.ideal_type],
            ]
              .filter((item) => item[1])
              .map(([title, body]) => (
                <section key={title} className="panel">
                  <h3>{title}</h3>
                  <p
                    style={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.8,
                    }}
                  >
                    {body}
                  </p>
                </section>
              ))}
          </div>
        </div>
      )}

      {activePhoto !== null && photos[activePhoto] && (
        <div
          className="photo-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="프로필 사진 확대 보기"
          onClick={() => setActivePhoto(null)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            ref={closeButtonRef}
            type="button"
            className="viewer-close"
            onClick={() => setActivePhoto(null)}
            aria-label="사진 확대 닫기"
          >
            ×
          </button>

          <div
            className="viewer-image-wrap"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={photos[activePhoto]}
              alt={`${p?.display_name || '프로필'} 확대 사진`}
              className="viewer-image"
            />
          </div>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="viewer-arrow viewer-prev"
                onClick={(event) => {
                  event.stopPropagation();
                  movePhoto(-1);
                }}
                aria-label="이전 사진"
              >
                ‹
              </button>

              <button
                type="button"
                className="viewer-arrow viewer-next"
                onClick={(event) => {
                  event.stopPropagation();
                  movePhoto(1);
                }}
                aria-label="다음 사진"
              >
                ›
              </button>

              <div className="viewer-counter">
                {activePhoto + 1} / {photos.length}
              </div>
            </>
          )}
        </div>
      )}

      <style jsx global>{`
        .photo-zoom-button {
          position: relative;
          display: block;
          width: 100%;
          padding: 0;
          margin: 0;
          border: 0;
          background: transparent;
          border-radius: 12px;
          overflow: hidden;
          cursor: zoom-in;
          text-align: left;
        }

        .photo-zoom-button img {
          display: block;
          width: 100%;
          height: auto;
          transition: transform .25s ease;
        }

        .photo-zoom-button:hover img {
          transform: scale(1.025);
        }

        .photo-zoom-hint {
          position: absolute;
          right: 12px;
          bottom: 12px;
          padding: 8px 12px;
          border-radius: 20px;
          background: rgba(35, 18, 28, .72);
          color: white;
          font-size: 12px;
          pointer-events: none;
        }

        .photo-viewer {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(13, 9, 13, .96);
          backdrop-filter: blur(8px);
          touch-action: pan-y;
        }

        .viewer-image-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 65px 65px 75px;
          box-sizing: border-box;
        }

        .viewer-image {
          display: block;
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 4px;
          user-select: none;
          -webkit-user-drag: none;
        }

        .viewer-close {
          position: absolute;
          z-index: 3;
          top: max(20px, env(safe-area-inset-top));
          right: 22px;
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 50%;
          background: rgba(255,255,255,.12);
          color: white;
          font-size: 30px;
          cursor: pointer;
        }

        .viewer-arrow {
          position: absolute;
          z-index: 2;
          top: 50%;
          transform: translateY(-50%);
          display: grid;
          place-items: center;
          width: 46px;
          height: 54px;
          border: 0;
          border-radius: 12px;
          background: rgba(255,255,255,.13);
          color: white;
          font-size: 42px;
          cursor: pointer;
        }

        .viewer-prev {
          left: 16px;
        }

        .viewer-next {
          right: 16px;
        }

        .viewer-counter {
          position: absolute;
          bottom: max(25px, env(safe-area-inset-bottom));
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 14px;
          letter-spacing: 2px;
          background: rgba(255,255,255,.12);
          border-radius: 20px;
          padding: 8px 18px;
        }

        @media (max-width: 650px) {
          .viewer-image-wrap {
            padding: 75px 12px 90px;
          }

          .viewer-arrow {
            width: 38px;
            height: 44px;
            font-size: 32px;
            background: rgba(0,0,0,.4);
          }

          .viewer-prev {
            left: 4px;
          }

          .viewer-next {
            right: 4px;
          }

          .viewer-close {
            right: 14px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .photo-zoom-button img {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}