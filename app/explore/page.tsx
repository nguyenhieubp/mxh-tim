import Explore from '../../features/Explore/Explore'
import SideBar from '../../features/SideBar/SideBar'
import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Khám phá',
}

const page = () => {
  return (
    <SideBar>
      <Explore></Explore>
    </SideBar>
  )
}

export default page