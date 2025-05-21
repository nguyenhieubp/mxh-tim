import Friend from '@/features/Friend/Friend'
import SideBar from '@/features/SideBar/SideBar'
import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bạn bè',
}

const page = () => {
    return (
        <SideBar>
            <Friend />
        </SideBar>
    )
}

export default page