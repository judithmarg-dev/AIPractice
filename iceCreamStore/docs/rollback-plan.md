Migration plan: Supabase + Next.js → Redux Toolkit + Vite

Architecture shift

The project currently has two entry points competing: the old Vite app (src/main.tsx → src/App.tsx → src/pages/FlavorCatalogPage.tsx) and the Next.js App Router (src/app/). The Next.js layer owns routing, SSR, middleware auth, and server actions. Supabase is the data layer for all staff pages.

After the swap: Vite is the sole build system. React Router handles routing. Redux Toolkit manages all state. Auth is a Redux slice with hardcoded credentials.

Files to change

┌─────┬─────────────────────────────────────────────┬───────────┬───────────────────────────────────────────────────────────┐
│  #  │                    File                     │                 Action                 │                       What changes                        │
├─────┼─────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
│     │                                             │                                        │ Remove next, @supabase/supabase-js, @supabase/ssr,        │
│ 1   │ package.json                                │ Edit      │ eslint-config-next; add @reduxjs/toolkit, react-redux,    │
│     │                                             │                                        │ react-router-dom; change scripts from next                │
│     │                                             │           │ dev/build/start/lint to vite dev/build/preview + eslint   │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 2   │ src/store/index.ts                          │ New       │ Redux store: combines authSlice, inventorySlice,          │
│     │                                             │                                        │ bookingsSlice                                             │
├─────┼─────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
│ 3   │ src/store/slices/authSlice.ts               │ New                                    │ Mock auth with hardcoded credentials, login/logout        │
│     │                                             │           │ actions                                                   │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 4   │ src/store/slices/inventorySlice.ts          │ New       │ IceCream[] state seeded from flavors.json, CRUD actions + │
│     │                                             │                                        │  selectors                                                │
├─────┼─────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
│ 5   │ src/store/slices/bookingsSlice.ts           │ New                                    │ Booking[] state, addBooking/updateBookingStatus actions + │
│     │                                             │           │  selectors                                                │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 6   │ src/store/hooks.ts                          │ New       │ Typed useAppDispatch / useAppSelector                     │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 7   │ src/main.tsx                                │ Edit      │ Wrap in <Provider> + <BrowserRouter>                      │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 8   │ src/App.tsx                                 │ Rewrite   │ React Router <Routes> replacing Next.js App Router        │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 9   │ src/app/layout.tsx                          │ Delete    │ Replaced by App.tsx                                       │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 10  │ src/app/page.tsx                            │ Move → sr │ next/link → react-router-dom Link                         │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 11  │ src/app/booking/page.tsx                    │ Move → sr │ next/navigation → react-router-dom; useRouter →           │
│     │                                             │                                        │ useNavigate                                               │
├─────┼─────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
│ 12  │ src/app/booking/confirmation/page.tsx       │ Move →                                 │ Same                                                      │
│     │                                             │ src/pages │                                                           │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 13  │ src/app/login/page.tsx                      │ Move → sr │ Supabase auth → dispatch(login(…))                        │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 14  │ src/app/staff/layout.tsx                    │ Move → sr │ No Supabase change needed                                 │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 15  │ src/app/staff/inventory/page.tsx            │ Move →    │ Server Component → client; Supabase query →               │
│     │                                             │ src/pages/staff/InventoryPage.tsx      │ useAppSelector(selectActiveItems)                         │
├─────┼─────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
│ 16  │ src/app/staff/inventory/actions.ts          │ Delete                                 │ Server actions → Redux dispatches inline                  │
├─────┼─────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
│ 17  │ src/app/staff/inventory/new/page.tsx        │ Move → src/pages/staff/NewItemPage.tsx │ Server action → Redux dispatch                            │
├─────┼─────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
│ 18  │ src/app/staff/inventory/[id]/edit/page.tsx  │ Move →                                 │ Supabase fetch → useAppSelector; useParams from           │
│     │                                             │ src/pages │ react-router                                              │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 19  │ src/app/staff/bookings/page.tsx             │ Delete (S │ Data comes from Redux now; BookingQueueClient becomes the │
│     │                                             │                                        │  page                                                     │
├─────┼─────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
│ 20  │ src/app/staff/bookings/actions.ts           │ Delete                                 │ Server action → Redux dispatch                            │
├─────┼─────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
│ 21  │ src/app/staff/analytics/page.tsx            │ Move →                                 │ Server Component → client; async queries → Redux          │
│     │                                             │ src/pages │ selectors                                                 │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 22  │ src/app/staff/analytics/ExportButton.tsx    │ Edit      │ Supabase fetch → useAppSelector for bookings              │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│     │                                             │           │ next/link → RR Link; next/navigation → RR                 │
│ 23  │ src/components/staff/StaffNav.tsx           │ Edit                                   │ useLocation/useNavigate; Supabase signOut →               │
│     │                                             │           │ dispatch(logout())                                        │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 24  │ src/components/staff/BookingQueueClient.tsx │ Edit      │ Remove Supabase Realtime; use Redux selectors + dispatch  │
│     │                                             │                                        │ instead of server action                                  │
├─────┼─────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
│ 25  │ src/components/staff/InventoryForm.tsx      │ Edit                                   │ action prop (FormData server action) → onSubmit prop      │
│     │                                             │           │ (Redux dispatch)                                          │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 26  │ src/services/bookingService.ts              │ Rewrite   │ Supabase calls → Redux dispatches via passed              │
│     │                                             │                                        │ store.dispatch                                            │
├─────┼─────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
│ 27  │ src/lib/supabaseClient.ts                   │ Delete                                 │ No Supabase                                               │
├─────┼─────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
│ 28  │ src/lib/supabaseServer.ts                   │ Delete                                 │ No Supabase                                               │
├─────┼─────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
│ 29  │ src/lib/analytics.ts                        │ Rewrite                                │ Supabase queries → pure functions over                    │
│     │                                             │           │ Booking[]/IceCream[] arrays                               │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 30  │ src/middleware.ts                           │ Delete    │ Next.js middleware → AuthGuard component in React Router  │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 31  │ src/components/AuthGuard.tsx                │ New       │ Reads isAuthenticated from Redux; redirects to /login     │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 32  │ next.config.ts                              │ Delete    │ No Next.js                                                │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 33  │ next-env.d.ts                               │ Delete    │ No Next.js                                                │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 34  │ .env.local.example                          │ Delete    │ No Supabase keys needed                                   │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 35  │ tsconfig.json                               │ Edit      │ Remove next plugin, next-env.d.ts include, .next/types    │
│     │                                             │                                        │ include; add @/* path alias for Vite                      │
├─────┼─────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
│ 36  │ eslint.config.js                            │ Edit                                   │ Remove next/core-web-vitals, next/typescript; use base TS │
│     │                                             │           │  config                                                   │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 37  │ vite.config.ts                              │ Edit      │ Add @/ path alias via resolve.alias                       │
├─────┼─────────────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 38  │ src/app/globals.css                         │ Move → sr │ Merge with existing; single CSS entry                     │
└─────┴─────────────────────────────────────────────┴────────────────────────────────────────┴───────────────────────────────────────────────────────────┘

Supabase → Redux mapping

┌────────────────────────────────────────────┬─────────────────────────────────────────────────────┬─────────────────────────────────────────────────────┐
│               Supabase call                │                        │                 Behavior difference                 │
├────────────────────────────────────────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ supabase.auth.signInWithPassword()         │ dispatch(login({       │ Checks hardcoded credentials instead of remote auth │
├────────────────────────────────────────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ supabase.auth.signOut()                    │ dispatch(logout(       │ Clears Redux isAuthenticated                        │
├────────────────────────────────────────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ supabase.auth.getUser() (middleware)       │ useAppSelector(sn      │ Client-side route guard instead of server           │
│                                            │ <AuthGuard>                                         │ middleware                                          │
├────────────────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────────┤
│ supabase.from('ice_creams').select(…)      │ useAppSelector(selectActiveItems)                   │ Reads from in-memory array                          │
├────────────────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────────┤
│ supabase.from('ice_creams').insert(…)      │ dispatch(addItem(…))                                │ Synchronous; no network                             │
├────────────────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────────┤
│ supabase.from('ice_creams').update(…)      │ dispatch(updateItem(…)) / dispatch(archiveItem(…))  │ Synchronous                                         │
├────────────────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────────┤
│ supabase.from('bookings').insert(…)        │ dispatch(addBooking(…))                             │ Synchronous                                         │
├────────────────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────────┤
│ supabase.from('bookings').select(…)        │ useAppSelector(selectAllBookings)                   │ Reads from in-memory array                          │
├────────────────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────────┤
│ supabase.from('bookings').update({status}) │ dispatch(updateBookingStatus({id, status}))         │ Synchronous                                         │
├────────────────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────────┤
│ supabase.channel().on('postgres_changes'…) │ Redux store.subscribe() or useAppSelector           │ No Realtime channel; React re-render on state       │
│                                            │ (reactive)             │ change is instant                                   │
├────────────────────────────────────────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ revalidatePath()                           │ Not needed             │ Redux triggers re-render automatically              │
├────────────────────────────────────────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ cookies() / cookie-based session           │ Redux auth.isAut       │ Session lost on page reload                         │
├────────────────────────────────────────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ Server Components (async pages)            │ Client component       │ No SSR; all client-side                             │
└────────────────────────────────────────────┴─────────────────────────────────────────────────────┴─────────────────────────────────────────────────────┘

Key behavior differences

1. Data does not persist across page reloads — Redux store is in-memory. Inventory is re-seeded from flavors.json on reload; bookings start empty.
2. Auth session lost on reload — user must log in again after r
3. No SSR — all pages are client-rendered via Vite.
4. Booking notifications are instant — React re-render on Reduxaltime with potential latency.