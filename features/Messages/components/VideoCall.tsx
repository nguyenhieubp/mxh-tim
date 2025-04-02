import React, { useEffect, useRef, useState } from 'react';
import { IUser } from '../Messages';
import socketService from '@/services/socketService';

interface VideoCallProps {
  currentUser: IUser;
  otherUser: IUser;
  onEndCall: () => void;
  isIncoming?: boolean;
}

const VideoCall: React.FC<VideoCallProps> = ({
  currentUser,
  otherUser,
  onEndCall,
  isIncoming = false,
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallConnected, setIsCallConnected] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Get local video stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize WebRTC peer connection
        const peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        peerConnectionRef.current = peerConnection;

        // Add local stream to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        // Handle incoming remote stream
        peerConnection.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socketService.sendIceCandidate(otherUser.id.toString(), event.candidate);
          }
        };

        // If this is the caller (not incoming call), create and send offer
        if (!isIncoming) {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          socketService.sendCallOffer(otherUser.id.toString(), offer, {
            id: currentUser.id.toString(),
            username: currentUser.username,
            profilePicture: currentUser.profilePicture
          });
        }

        // Listen for ICE candidates from the other user
        socketService.onIceCandidate((candidate) => {
          peerConnection.addIceCandidate(candidate);
        });

        // Listen for call answer
        socketService.onCallAnswer(async (answer) => {
          await peerConnection.setRemoteDescription(answer);
          setIsCallConnected(true);
        });

        // If this is incoming call, listen for offer and send answer
        if (isIncoming) {
          socketService.onCallOffer(async (offer) => {
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socketService.sendCallAnswer(otherUser.id.toString(), answer);
            setIsCallConnected(true);
          });
        }

      } catch (error) {
        console.error('Error initializing call:', error);
        onEndCall();
      }
    };

    initializeCall();

    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    socketService.sendEndCall(otherUser.id.toString());
    onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-4xl p-4">
        {/* Remote video (large) */}
        <div className="relative aspect-video w-full bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Local video (small overlay) */}
          <div className="absolute bottom-4 right-4 w-1/4 aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Call controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={handleEndCall}
            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Connection status */}
        {!isCallConnected && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
            Đang kết nối...
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall; 