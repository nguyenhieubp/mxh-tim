import More from '@/features/More/More'
import SideBar from '../../features/SideBar/SideBar'
import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tùy chọn',
}

const page = () => {
  return (
    <SideBar>
      <More></More>
    </SideBar>
  )
}

export default page