import ProfilePage from '../../features/Profile/DetailUser'
import SideBar from '../../features/SideBar/SideBar'
import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trang cá nhân',
}

const page = () => {
  return (
    <SideBar>
      <div>
        <ProfilePage></ProfilePage>
      </div>
    </SideBar>
  )
}

export default page