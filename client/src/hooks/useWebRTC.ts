import { useEffect, useRef, useState } from 'react'
import { useUserStore } from '@/store/userStore'

export const useWebRTC = (roomId: string) => {
  const { 
    user, 
    addWebRTCListeners, 
    removeWebRTCListeners, 
    joinVideoRoom, 
    leaveVideoRoom,
    sendWebRTCOffer,
    sendWebRTCAnswer,
    sendWebRTCIceCandidate
  } = useUserStore()

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const localVideoRef = useRef<HTMLVideoElement>(null)

  const pcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }

  useEffect(() => {
    if (!user) return

    // Set up WebRTC listeners using Zustand methods
    addWebRTCListeners({
      onUserJoined: handleUserJoined,
      onWebRTCOffer: handleReceiveOffer,
      onWebRTCAnswer: handleReceiveAnswer,
      onWebRTCIceCandidate: handleReceiveIceCandidate,
      onUserLeft: handleUserLeft
    })

    // Join video room
    joinVideoRoom(roomId)
    
    initializeMedia()

    return () => {
      cleanup()
      removeWebRTCListeners()
    }
  }, [roomId, user])

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
    }
  }

  const createPeerConnection = (socketId: string) => {
    const pc = new RTCPeerConnection(pcConfig)
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWebRTCIceCandidate(socketId, event.candidate)
      }
    }

    pc.ontrack = (event) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev)
        newMap.set(socketId, event.streams[0])
        return newMap
      })
    }

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream)
      })
    }

    peerConnections.current.set(socketId, pc)
    return pc
  }

  const handleUserJoined = async ({ userId: newUserId, socketId }: { userId: string, socketId: string }) => {
    const pc = createPeerConnection(socketId)
    
    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      
      sendWebRTCOffer(socketId, offer, roomId)
    } catch (error) {
      console.error('Error creating offer:', error)
    }
  }

  const handleReceiveOffer = async ({ offer, sender }: { offer: RTCSessionDescriptionInit, sender: string }) => {
    const pc = createPeerConnection(sender)
    
    try {
      await pc.setRemoteDescription(offer)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      
      sendWebRTCAnswer(sender, answer)
    } catch (error) {
      console.error('Error handling offer:', error)
    }
  }

  const handleReceiveAnswer = async ({ answer, sender }: { answer: RTCSessionDescriptionInit, sender: string }) => {
    const pc = peerConnections.current.get(sender)
    if (pc) {
      try {
        await pc.setRemoteDescription(answer)
      } catch (error) {
        console.error('Error handling answer:', error)
      }
    }
  }

  const handleReceiveIceCandidate = async ({ candidate, sender }: { candidate: RTCIceCandidateInit, sender: string }) => {
    const pc = peerConnections.current.get(sender)
    if (pc) {
      try {
        await pc.addIceCandidate(candidate)
      } catch (error) {
        console.error('Error adding ICE candidate:', error)
      }
    }
  }

  const handleUserLeft = ({ socketId }: { socketId: string }) => {
    const pc = peerConnections.current.get(socketId)
    if (pc) {
      pc.close()
      peerConnections.current.delete(socketId)
    }
    
    setRemoteStreams(prev => {
      const newMap = new Map(prev)
      newMap.delete(socketId)
      return newMap
    })
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const cleanup = () => {
    localStream?.getTracks().forEach(track => track.stop())
    peerConnections.current.forEach(pc => pc.close())
    leaveVideoRoom(roomId)
  }

  return {
    localStream,
    remoteStreams,
    localVideoRef,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio
  }
}
