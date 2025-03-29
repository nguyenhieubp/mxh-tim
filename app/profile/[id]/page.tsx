import { notFound } from "next/navigation";
import UserProfilePage from "@/features/Profile/DetailUser";
import SideBar from "@/features/SideBar/SideBar";

interface ProfilePageProps {
    params: {
        id: string;
    };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    if (!params.id) {
        notFound();
    }

    return (
        <SideBar>
            <UserProfilePage userId={params.id} />
        </SideBar>
    );
}