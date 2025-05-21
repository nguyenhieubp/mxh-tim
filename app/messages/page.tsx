import React from 'react'
import SideBar from '../../features/SideBar/SideBar'
import Messages from '../../features/Messages/Messages'
import LayoutMessage from '@/components/common/LayoutMessage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tin nhắn',
}

const page = () => {
  return (
    <div>
      <Messages />
    </div>
  )
}

export default page