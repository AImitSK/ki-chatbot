'use client'

import { Avatar } from '@/components/ui/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/ui/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/ui/navbar'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/ui/sidebar'
import { SidebarLayout } from '@/components/ui/sidebar-layout'
import { getEvents } from '@/app/data'
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/16/solid'
import {
  HomeIcon,
  QuestionMarkCircleIcon,
  Square2StackIcon,
  TicketIcon,
} from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { urlFor } from '@/lib/sanity/image'


function getUserAvatar(session: any) {
  if (session?.user?.avatar?.asset?._ref) {
    return urlFor(session.user.avatar).width(80).height(80).url()
  }
  return '/icon/avatar.svg'
}


function AccountDropdownMenu({ anchor }: { anchor: 'top start' | 'bottom end' }) {
  return (
      <DropdownMenu className="min-w-64" anchor={anchor}>
        <DropdownItem href="/dashboard/profil">
          <UserCircleIcon />
          <DropdownLabel>Mein Profil</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem href="#">
          <ShieldCheckIcon />
          <DropdownLabel>Datenschutz</DropdownLabel>
        </DropdownItem>
        <DropdownItem href="#">
          <LightBulbIcon />
          <DropdownLabel>Feedback</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem onClick={() => signOut({ callbackUrl: '/auth/login' })}>
          <ArrowRightStartOnRectangleIcon />
          <DropdownLabel>Abmelden</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
  )
}

export function ApplicationLayout({
                                    events,
                                    children,
                                  }: {
  events: Awaited<ReturnType<typeof getEvents>>
  children: React.ReactNode
}) {
  let pathname = usePathname()
  const { data: session } = useSession()
  const avatarUrl = getUserAvatar(session)

  return (
      <SidebarLayout
          navbar={
            <Navbar>
              <NavbarSpacer />
              <NavbarSection>
                <Dropdown>
                  <DropdownButton as={NavbarItem}>
                    <Avatar src={avatarUrl} square />
                  </DropdownButton>
                  <AccountDropdownMenu anchor="bottom end" />
                </Dropdown>
              </NavbarSection>
            </Navbar>
          }
          sidebar={
            <Sidebar>
              <SidebarHeader>
                <Dropdown>
                  <DropdownButton as={SidebarItem}>
                    <Avatar src="/icon/avatar.svg" />
                    <SidebarLabel>SK Online Marketing</SidebarLabel>
                    <ChevronDownIcon />
                  </DropdownButton>
                  <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
                    <DropdownItem href="/dashboard/profil">
                      <UserCircleIcon />
                      <DropdownLabel>Profil</DropdownLabel>
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem href="/dashboard/support">
                      <QuestionMarkCircleIcon />
                      <DropdownLabel>Support</DropdownLabel>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </SidebarHeader>

              <SidebarBody>
                <SidebarSection>
                  <SidebarItem href="/" current={pathname === '/'}>
                    <HomeIcon />
                    <SidebarLabel>Dashboard</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/dashboard/profil" current={pathname.startsWith('/dashboard/profil')}>
                    <UserCircleIcon />
                    <SidebarLabel>Profil</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/dashboard/unternehmen" current={pathname.startsWith('/dashboard/unternehmen')}>
                    <Square2StackIcon />
                    <SidebarLabel>Unternehmen</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/dashboard/vertrag" current={pathname.startsWith('/dashboard/vertrag')}>
                    <TicketIcon />
                    <SidebarLabel>Vertrag</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>

                <SidebarSpacer />

                <SidebarSection>
                  <SidebarItem href="/dashboard/support">
                    <QuestionMarkCircleIcon />
                    <SidebarLabel>Support</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>
              </SidebarBody>

              <SidebarFooter className="max-lg:hidden">
                <Dropdown>
                  <DropdownButton as={SidebarItem}>
      <span className="flex min-w-0 items-center gap-3">
        <Avatar
            src={session?.user?.avatar?.asset?._ref
                ? `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2024-01-29/images/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${session.user.avatar.asset._ref}`
                : '/icon/avatar.svg'}
            initials={session?.user?.name?.charAt(0).toUpperCase() || '?'}
            className="size-10 bg-zinc-200 dark:bg-zinc-800"
            square
            alt={session?.user?.name || 'User Avatar'}
        />
        <span className="min-w-0">
          <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
            {session?.user?.name || 'Nicht angemeldet'}
          </span>
          <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
            {session?.user?.email}
          </span>
        </span>
      </span>
                    <ChevronUpIcon />
                  </DropdownButton>
                  <AccountDropdownMenu anchor="top start" />
                </Dropdown>
              </SidebarFooter>
            </Sidebar>
          }
      >
        {children}
      </SidebarLayout>
  )
}