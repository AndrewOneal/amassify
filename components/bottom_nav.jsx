import { useRouter } from 'next/router';
import Link from 'next/link';

const BottomNav = () => {
  const router = useRouter();

  const isActive = (pathname) => router.pathname === pathname;

  return (
    <div class="btm-nav">
      <Link href="/">
        <button id="profile" className={`text-success ${isActive('/profile') ? 'active' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
      </Link>
      <Link href="/ratings">
        <button id="ratings" className={`text-success ${isActive('/ratings') ? 'active' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path d="M12 7.09l2.45 1.49-.65-2.81L16 3.89l-2.89-.25L12 1l-1.13 2.64L8 3.89l2.18 1.88-.68 2.81L12 7.09M15 23H9V10h6v13M1 17v6h6v-6H1m4 4H3v-2h2v2m12-8v10h6V13h-6m4 8h-2v-6h2v6z" />
          </svg>
          </button>
      </Link>
      <Link href="/insights">
        <button id="insights" className={`text-success ${isActive('/insights') ? 'active' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
          </button>
      </Link>
    </div>
  )
}

export default BottomNav;

