export interface IMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp?: Date;
  createdAt?: Date | string;
  read?: boolean;
}

export interface IChatMessage {
  text: string;
  sender: "me" | "other";
  timestamp?: Date;
} 