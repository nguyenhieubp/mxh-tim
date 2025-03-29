import React from 'react'
import SideBar from '../../features/SideBar/SideBar'
import Messages from '../../features/Messages/Messages'

const page = () => {
  return (
    <SideBar>
      <Messages />
    </SideBar>
  )
}

export default page