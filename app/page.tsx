
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Profile } from '../lib/supabase';

export default function Home() {
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase()
      .from('profiles')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError('프로필을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
        setProfiles(data || []);
        setLoading(false);
      });
  }, []);

  const visibleProfiles = profiles.filter(
    (profile) => profile.gender === gender
  );

  return (
    <div className="duo-page">
      <header className="duo-hero">
        <div className="duo-hero-glow" />

        <div className="duo-container duo-hero-content">
          <div className="duo-top">
            <span className="duo-eyebrow">
              RED CRYSTAL PRESENTS
            </span>
            <span className="duo-top-heart">♡</span>
          </div>

          <div className="duo-hero-layout">
            <div className="duo-hero-copy">
              <h1>비공식듀오</h1>
              <div className="duo-title-accent" />
              <p>
                레드크리스탈 중매사가 엄선한 소개팅 프로필
              </p>
            </div>

            <div className="duo-heart-art" aria-hidden="true">
              <span className="duo-heart-one">♡</span>
              <span className="duo-heart-two">♡</span>
            </div>
          </div>
        </div>

        <svg
          className="duo-wave"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,35 C250,-20 420,25 700,65 C950,105 1160,35 1440,30 L1440,100 L0,100 Z"
            fill="#fcf8f6"
          />
        </svg>
      </header>

      <main className="duo-container duo-main">
        <div className="duo-tabs">
          <button
            type="button"
            className={`duo-tab ${gender === 'female' ? 'active' : ''}`}
            onClick={() => setGender('female')}
            aria-pressed={gender === 'female'}
          >
            ♙ 여성 프로필
          </button>

          <button
            type="button"
            className={`duo-tab ${gender === 'male' ? 'active' : ''}`}
            onClick={() => setGender('male')}
            aria-pressed={gender === 'male'}
          >
            ♟ 남성 프로필
          </button>
        </div>

        <div className="duo-section-heading">
          <div>
            <h2>
              {gender === 'female' ? '여성' : '남성'} 소개팅 프로필
            </h2>
            <p>한 사람 한 사람, 정성스럽게 소개합니다.</p>
          </div>
          <span className="duo-section-heart">♡</span>
        </div>

        {loading ? (
          <div className="duo-empty">
            프로필을 불러오는 중입니다.
          </div>
        ) : error ? (
          <div className="duo-empty duo-error">{error}</div>
        ) : visibleProfiles.length === 0 ? (
          <div className="duo-empty">
            현재 공개된 프로필이 없습니다.
          </div>
        ) : (
          <div className="duo-grid">
            {visibleProfiles.map((profile, index) => (
              <Link
                href={`/profile/${profile.id}`}
                className="duo-card"
                key={profile.id}
              >
                <div className="duo-card-photo">
                  {profile.photos?.[0] ? (
                    <img
                      src={profile.photos[0]}
                      alt={profile.display_name}
                      loading={index < 4 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <div className="duo-photo-empty">
                      사진 준비 중
                    </div>
                  )}
                </div>

                <div className="duo-card-body">
                  <h3>{profile.display_name}</h3>
                  <p>
                    {[
                      profile.birth_year
                        ? `${profile.birth_year}년생`
                        : null,
                      profile.job,
                      profile.region,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <span className="duo-card-more">
                    프로필 자세히 보기 <span>↗</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

     
<footer className="duo-footer">
  <div
    className="duo-container"
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    }}
  >
    <span>© 비공식듀오 · RED CRYSTAL</span>

    <Link
      href="/admin"
      style={{
        color: '#9b828b',
        textDecoration: 'none',
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      🔒 관리자 ↗
    </Link>
  </div>
</footer>


      <style jsx global>{`
        .duo-page {
          min-height: 100vh;
          background: #fcf8f6;
          color: #321c27;
        }

        .duo-container {
          width: min(1160px, calc(100% - 48px));
          margin: 0 auto;
        }

        .duo-hero {
          position: relative;
          min-height: 355px;
          overflow: hidden;
          background:
            radial-gradient(ellipse at 75% 75%, #743047 0%, transparent 45%),
            linear-gradient(115deg, #2b1421 0%, #441b2b 60%, #321520 100%);
          color: white;
        }

        .duo-hero-glow {
          position: absolute;
          width: 460px;
          height: 230px;
          right: 7%;
          top: 85px;
          border-radius: 50%;
          background: #b33c68;
          filter: blur(100px);
          opacity: .18;
          pointer-events: none;
        }

        .duo-hero-content {
          position: relative;
          z-index: 1;
        }

        .duo-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 36px;
        }

        .duo-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          color: #f1b8ca;
        }

        .duo-top-heart {
          font-size: 27px;
          color: #fff;
        }

        .duo-hero-layout {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 235px;
        }

        .duo-hero-copy h1 {
          margin: 0;
          color: #fff;
          font-size: clamp(42px, 5vw, 64px);
          font-weight: 800;
          letter-spacing: -2.5px;
          line-height: 1.2;
        }

        .duo-title-accent {
          width: 110px;
          height: 4px;
          margin: 15px 0 24px;
          border-radius: 10px;
          background: linear-gradient(90deg, #c65c80, transparent);
        }

        .duo-hero-copy p {
          margin: 0;
          color: #f8e6eb;
          font-size: 16px;
          letter-spacing: -.3px;
        }

        .duo-heart-art {
          position: relative;
          width: 320px;
          height: 220px;
          flex-shrink: 0;
          filter: drop-shadow(0 14px 20px rgba(242, 133, 166, .22));
        }

        .duo-heart-one,
        .duo-heart-two {
          position: absolute;
          font-family: Georgia, serif;
          font-weight: 400;
          line-height: 1;
          color: #f6b0c8;
          text-shadow:
            2px 2px 0 #a73c62,
            0 0 25px rgba(255, 162, 196, .4);
        }

        .duo-heart-one {
          font-size: 210px;
          left: 10px;
          top: -12px;
          transform: rotate(-15deg);
        }

        .duo-heart-two {
          font-size: 160px;
          right: 5px;
          top: 28px;
          transform: rotate(15deg);
          opacity: .85;
        }

        .duo-wave {
          position: absolute;
          left: 0;
          bottom: -1px;
          width: 100%;
          height: 75px;
          display: block;
        }

        .duo-main {
          padding-top: 22px;
          padding-bottom: 90px;
        }

        .duo-tabs {
          display: flex;
          gap: 9px;
          margin-bottom: 34px;
        }

        .duo-tab {
          border: 1px solid #e8d4db;
          background: #fff;
          color: #84314f;
          border-radius: 30px;
          padding: 13px 22px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s ease;
        }

        .duo-tab:hover {
          border-color: #913452;
          transform: translateY(-2px);
        }

        .duo-tab.active {
          background: linear-gradient(135deg, #983b5a, #762842);
          color: white;
          border-color: transparent;
          box-shadow: 0 5px 14px rgba(118, 40, 66, .18);
        }

        .duo-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
          border-bottom: 1px solid #eadfe1;
          padding-bottom: 18px;
        }

        .duo-section-heading h2 {
          margin: 0 0 9px;
          padding-left: 13px;
          border-left: 4px solid #963b59;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -.8px;
        }

        .duo-section-heading p {
          margin: 0;
          color: #987e87;
          font-size: 13px;
        }

        .duo-section-heart {
          font-size: 26px;
          color: #9b4560;
        }

        .duo-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
        }

        .duo-card {
          display: block;
          overflow: hidden;
          border-radius: 18px;
          background: white;
          border: 1px solid #f0e5e7;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 7px 25px rgba(72, 29, 44, .055);
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .duo-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 18px 35px rgba(72, 29, 44, .14);
        }

        .duo-card-photo {
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: #eee5e8;
        }

        .duo-card-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .4s ease;
        }

        .duo-card:hover .duo-card-photo img {
          transform: scale(1.045);
        }

        .duo-photo-empty {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          color: #9a818b;
          font-size: 14px;
        }

        .duo-card-body {
          padding: 18px 17px 20px;
        }

        .duo-card-body h3 {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 750;
          color: #391d2a;
        }

        .duo-card-body p {
          margin: 0;
          min-height: 38px;
          color: #947f88;
          font-size: 12px;
          line-height: 1.6;
        }

        .duo-card-more {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 14px;
          padding-top: 13px;
          border-top: 1px solid #f2e9ec;
          font-size: 12px;
          font-weight: 600;
          color: #963b59;
        }

        .duo-card-more span {
          font-size: 17px;
        }

        .duo-empty {
          padding: 75px 20px;
          border: 1px solid #ecdee2;
          border-radius: 16px;
          background: white;
          text-align: center;
          color: #8c7580;
        }

        .duo-error {
          color: #b32645;
        }

        .duo-footer {
          padding: 28px 0;
          background: #f6eff1;
          border-top: 1px solid #eadfe2;
          color: #9b828b;
          font-size: 12px;
        }

        @media (max-width: 900px) {
          .duo-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }

          .duo-heart-art {
            transform: scale(.75);
            transform-origin: right center;
          }
        }

        @media (max-width: 650px) {
          .duo-container {
            width: min(100% - 32px, 1160px);
          }

          .duo-hero {
            min-height: 295px;
          }

          .duo-top {
            padding-top: 25px;
          }

          .duo-eyebrow {
            font-size: 9px;
            letter-spacing: 2px;
          }

          .duo-hero-layout {
            min-height: 200px;
          }

          .duo-hero-copy h1 {
            font-size: 42px;
          }

          .duo-hero-copy p {
            max-width: 250px;
            font-size: 13px;
            line-height: 1.7;
          }

          .duo-heart-art {
            position: absolute;
            right: -100px;
            opacity: .25;
            transform: scale(.65);
          }

          .duo-wave {
            height: 48px;
          }

          .duo-main {
            padding-top: 14px;
          }

          .duo-tabs {
            margin-bottom: 28px;
          }

          .duo-tab {
            padding: 12px 16px;
            font-size: 13px;
          }

          .duo-section-heading h2 {
            font-size: 21px;
          }

          .duo-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 13px;
          }

          .duo-card {
            border-radius: 13px;
          }

          .duo-card-body {
            padding: 13px 12px 15px;
          }

          .duo-card-body h3 {
            font-size: 16px;
          }

          .duo-card-body p {
            font-size: 11px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .duo-card,
          .duo-card-photo img,
          .duo-tab {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
