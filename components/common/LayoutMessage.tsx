import Link from 'next/link'
import React from 'react'

const LayoutMessage = () => {
    return (
        <Link href={"/"}>
            <h1 className="text-3xl text-center  cursor-pointer font-bold mb-8 px-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-pink-600 hover:to-purple-600 transition-all duration-300">
                Socialverse Message
            </h1>
        </Link>
    )
}

export default LayoutMessage