export interface IMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp?: Date;
  read?: boolean;
}

export interface IChatMessage {
  text: string;
  sender: "me" | "other";
  timestamp?: Date;
} 