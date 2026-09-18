import Link from 'next/link';

/**
 * 로케일 레이아웃 밖(예: /admin 하위 잘못된 주소)에서 뜨는 404.
 * 루트 레이아웃이 children만 반환하므로 html/body를 직접 구성한다.
 */
export default function RootNotFound() {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white font-body text-neutral-900 antialiased">
        <div className="flex min-h-screen items-center justify-center px-6 py-24">
          <div className="mx-auto max-w-lg text-center">
            <p className="font-display text-7xl font-extrabold tracking-tight text-teal-600 sm:text-8xl">
              404
            </p>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              페이지를 찾을 수 없습니다
            </h1>
            <p className="mt-2 text-base text-slate-500">Page not found</p>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              요청하신 페이지가 존재하지 않거나 이동되었습니다.
            </p>

            <div className="mt-10">
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-teal-600 px-7 text-base font-medium text-white transition-colors hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
