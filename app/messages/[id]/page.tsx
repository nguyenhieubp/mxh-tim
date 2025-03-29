import Messages from "@/features/Messages/Messages";
import SideBar from "@/features/SideBar/SideBar";
import { notFound } from "next/navigation";
import React from "react";

interface MessagePageProps {
  params: {
    id: string;
  };
}

const page = ({ params }: MessagePageProps) => {
  if (!params.id) {
    notFound();
  }

  return (
    <SideBar>
      <Messages />
    </SideBar>
  );
};

export default page;
