'use client';

import { usePathname } from 'next/navigation';
import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineExplore } from "react-icons/md";
import { PiTelegramLogo } from "react-icons/pi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegSquarePlus } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { MdOutlineSettings } from "react-icons/md";
import SideBarItem from './SideBarItem';

import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from "@/redux/configs/hooks";
import { useEffect } from 'react';
import { getCurrentUser } from '@/redux/features/auth';

interface SideBarNavProps {
    setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
    setShowCreatePost: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideBarNav = ({ setShowNotifications, setShowCreatePost }: SideBarNavProps) => {
    const dispacth = useAppDispatch();
    const pathname = usePathname();
    const { t } = useTranslation();

    const userId = useAppSelector(state => state.auth.user?.userId);
    useEffect(() => {
        dispacth(getCurrentUser())
    }, [userId])


    return (
        <ul className="space-y-2">
            <li>
                <SideBarItem
                    href="/"
                    icon={<IoHomeOutline size={25} />}
                    label={t('navigation.home')}
                    isActive={pathname === '/'}
                />
            </li>
            <li>
                <SideBarItem
                    href="/explore"
                    icon={<MdOutlineExplore size={25} />}
                    label={t('navigation.explore')}
                    isActive={pathname === '/explore'}
                />
            </li>
            <li>
                <SideBarItem
                    href="/messages"
                    icon={<PiTelegramLogo size={25} />}
                    label={t('navigation.messages')}
                    isActive={pathname === '/messages'}
                />
            </li>
            <li>
                <SideBarItem
                    icon={<FaRegHeart size={25} />}
                    label={t('navigation.notifications')}
                    onClick={() => setShowNotifications(prev => !prev)}
                />
            </li>
            <li>
                <SideBarItem
                    icon={<FaRegSquarePlus size={25} />}
                    label={t('navigation.create')}
                    onClick={() => setShowCreatePost(prev => !prev)}
                />
            </li>
            <li>
                <SideBarItem
                    href={`/profile/${userId}`}
                    icon={<CgProfile size={25} />}
                    label={t('navigation.profile')}
                    isActive={pathname.startsWith('/profile')}
                />
            </li>
            <li>
                <SideBarItem
                    href="/more"
                    icon={<MdOutlineSettings size={25} />}
                    label={t('navigation.more')}
                    isActive={pathname === '/more'}
                />
            </li>
        </ul>
    );
};

export default SideBarNav;