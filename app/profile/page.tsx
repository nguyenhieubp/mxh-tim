import ProfilePage from '../../features/Profile/DetailUser'
import SideBar from '../../features/SideBar/SideBar'
import React from 'react'

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