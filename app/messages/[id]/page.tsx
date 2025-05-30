import Messages from "@/features/Messages/Messages";
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
    <Messages />
  );
};

export default page;
