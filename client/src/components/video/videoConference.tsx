'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Users, ArrowLeft, Settings, MoreVertical, MessageSquare, Share, Maximize2, Minimize2 } from 'lucide-react'

interface Participant {
  id: string
  name: string
  profilePicture?: string
}

interface Conversation {
  id: string
  type: 'PRIVATE' | 'GROUP'
  name?: string
  description?: string
  groupImage?: string
  participants: Participant[]
  participantCount: number
  messageCount: number
  isArchived: boolean
  lastMessageText?: string
  lastMessageSender?: string
  lastMessageTimestamp?: string
  lastMessageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'LOCATION' | 'SYSTEM'
  createdAt: string
  updatedAt: string
}

interface VideoConferenceProps {
  conversationId: string
  onLeaveCall: () => void
  onReturnToChat: () => void
  // conversation: Conversation
}

const VideoConference: React.FC<VideoConferenceProps> = ({ conversationId, onLeaveCall, onReturnToChat }) => {
  const { user, addWebRTCListeners, removeWebRTCListeners, joinVideoRoom, leaveVideoRoom, sendWebRTCOffer, sendWebRTCAnswer, sendWebRTCIceCandidate } = useUserStore()
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL

  var conversation: Conversation = {
    id: '',
    type: 'PRIVATE',
    name: '',
    description: '',
    groupImage: '',
    participants: [],
    participantCount: 0,
    messageCount: 0,
    isArchived: false,
    lastMessageText: '',
    lastMessageSender: '',
    lastMessageTimestamp: '',
    lastMessageType: 'TEXT',
    createdAt: '',
    updatedAt: '',
  }

  const getConversation = async () => {
    const conversationResponse = await fetch(`${backend}/conversation/getConversationByIdWithParticipants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversationId: conversationId }),
    })
    conversation = await conversationResponse.json()
  }
  // const participants = conversation.participants

  // Core WebRTC state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, { stream: MediaStream; userId: string }>>(new Map())
  const [connectedUsers, setConnectedUsers] = useState<string[]>([])

  // Media control state
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isCallActive, setIsCallActive] = useState(false)

  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'failed'>('connecting')

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const callStartTime = useRef<number>(Date.now())
  const controlsTimeoutRef = useRef<NodeJS.Timeout>(null)

  const pcConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }],
  }

  // Initialize call on mount
  useEffect(() => {
    if (!user) return
    initializeCall()
    return cleanup
  }, [conversationId, user])

  // Call duration timer
  useEffect(() => {
    if (!isCallActive) return

    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [isCallActive])

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      setShowControls(true)
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    const handleMouseMove = () => resetControlsTimeout()

    if (isFullscreen) {
      document.addEventListener('mousemove', handleMouseMove)
      resetControlsTimeout()
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isFullscreen])

  const initializeCall = async () => {
    try {
      setConnectionStatus('connecting')

      // Get user media with enhanced constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Set up WebRTC listeners
      addWebRTCListeners({
        onUserJoined: handleUserJoined,
        onWebRTCOffer: handleReceiveOffer,
        onWebRTCAnswer: handleReceiveAnswer,
        onWebRTCIceCandidate: handleReceiveIceCandidate,
        onUserLeft: handleUserLeft,
      })

      // Join video room
      joinVideoRoom(conversationId)
      setIsCallActive(true)
      setConnectionStatus('connected')
      callStartTime.current = Date.now()
    } catch (error) {
      console.error('Error initializing call:', error)
      setConnectionStatus('failed')

      // More user-friendly error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('Permission denied')) {
        alert('Camera and microphone access denied. Please enable permissions and refresh.')
      } else if (errorMessage.includes('NotFound')) {
        alert('No camera or microphone found. Please connect your devices and try again.')
      } else {
        alert('Failed to start video call. Please check your devices and try again.')
      }
    }
  }

  const createPeerConnection = (socketId: string, userId: string) => {
    const pc = new RTCPeerConnection(pcConfig)

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWebRTCIceCandidate(socketId, event.candidate)
      }
    }

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => {
        const newMap = new Map(prev)
        newMap.set(socketId, { stream: event.streams[0], userId })
        return newMap
      })
    }

    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${socketId}:`, pc.connectionState)

      if (pc.connectionState === 'connected') {
        setConnectedUsers((prev) => [...prev.filter((id) => id !== userId), userId])
        setConnectionStatus('connected')
      } else if (pc.connectionState === 'disconnected') {
        setConnectionStatus('reconnecting')
        setConnectedUsers((prev) => prev.filter((id) => id !== userId))
      } else if (pc.connectionState === 'failed') {
        setConnectionStatus('failed')
        setConnectedUsers((prev) => prev.filter((id) => id !== userId))
      }
    }

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream)
      })
    }

    peerConnections.current.set(socketId, pc)
    return pc
  }

  const handleUserJoined = async ({ userId: newUserId, socketId }: { userId: string; socketId: string }) => {
    const pc = createPeerConnection(socketId, newUserId)

    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      sendWebRTCOffer(socketId, offer, conversationId)
    } catch (error) {
      console.error('Error creating offer:', error)
    }
  }

  const handleReceiveOffer = async ({ offer, sender, userId: senderUserId }: { offer: RTCSessionDescriptionInit; sender: string; userId?: string }) => {
    const pc = createPeerConnection(sender, senderUserId || sender)

    try {
      await pc.setRemoteDescription(offer)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      sendWebRTCAnswer(sender, answer)
    } catch (error) {
      console.error('Error handling offer:', error)
    }
  }

  const handleReceiveAnswer = async ({ answer, sender }: { answer: RTCSessionDescriptionInit; sender: string }) => {
    const pc = peerConnections.current.get(sender)
    if (pc) {
      try {
        await pc.setRemoteDescription(answer)
      } catch (error) {
        console.error('Error handling answer:', error)
      }
    }
  }

  const handleReceiveIceCandidate = async ({ candidate, sender }: { candidate: RTCIceCandidateInit; sender: string }) => {
    const pc = peerConnections.current.get(sender)
    if (pc) {
      try {
        await pc.addIceCandidate(candidate)
      } catch (error) {
        console.error('Error adding ICE candidate:', error)
      }
    }
  }

  const handleUserLeft = ({ socketId, userId }: { socketId: string; userId?: string }) => {
    const pc = peerConnections.current.get(socketId)
    if (pc) {
      pc.close()
      peerConnections.current.delete(socketId)
    }

    setRemoteStreams((prev) => {
      const newMap = new Map(prev)
      newMap.delete(socketId)
      return newMap
    })

    if (userId) {
      setConnectedUsers((prev) => prev.filter((id) => id !== userId))
    }
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleLeaveCall = () => {
    cleanup()
    onLeaveCall()
  }

  const cleanup = () => {
    // Stop all tracks
    localStream?.getTracks().forEach((track) => track.stop())

    // Close all peer connections
    peerConnections.current.forEach((pc) => pc.close())
    peerConnections.current.clear()

    // Clear state
    setRemoteStreams(new Map())
    setConnectedUsers([])
    setIsCallActive(false)

    // Leave video room
    leaveVideoRoom(conversationId)

    // Remove WebRTC listeners
    removeWebRTCListeners()
  }

  const getParticipantInfo = (userId: string) => {
    const participant = conversation?.participants?.find((p) => p.id === userId)
    return {
      name: participant?.name || 'Unknown User',
      profilePicture: participant?.profilePicture,
    }
  }

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-400'
      case 'connecting':
        return 'text-yellow-400'
      case 'reconnecting':
        return 'text-orange-400'
      case 'failed':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const remoteStreamsArray = Array.from(remoteStreams.entries())
  const totalParticipants = remoteStreamsArray.length + 1

  // Calculate grid layout
  const getGridClass = () => {
    if (totalParticipants === 1) return 'grid-cols-1'
    if (totalParticipants === 2) return 'grid-cols-2'
    if (totalParticipants <= 4) return 'grid-cols-2 grid-rows-2'
    if (totalParticipants <= 6) return 'grid-cols-3 grid-rows-2'
    return 'grid-cols-3 grid-rows-3'
  }

  return (
    <div className={`flex flex-col bg-gray-900 text-white transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'}`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 transition-transform duration-300 ${
          isFullscreen && !showControls ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex items-center space-x-3">
          <button onClick={onReturnToChat} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Return to chat">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            {conversation?.groupImage ? (
              <img src={conversation.groupImage} alt={conversation.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">{conversation?.name?.charAt(0).toUpperCase() || 'G'}</span>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold">{conversation?.name || 'Video Call'}</h2>
              <div className="flex items-center space-x-2 text-sm">
                <span
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-400' : connectionStatus === 'connecting' ? 'bg-yellow-400' : connectionStatus === 'reconnecting' ? 'bg-orange-400' : 'bg-red-400'
                  }`}
                />
                <span className={getConnectionStatusColor()}>
                  {connectionStatus === 'connected' && `${connectedUsers.length + 1} participant${connectedUsers.length !== 0 ? 's' : ''}`}
                  {connectionStatus === 'connecting' && 'Connecting...'}
                  {connectionStatus === 'reconnecting' && 'Reconnecting...'}
                  {connectionStatus === 'failed' && 'Connection failed'}
                </span>
                {isCallActive && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">{formatDuration(callDuration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={onReturnToChat} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Open chat">
            <MessageSquare className="w-5 h-5" />
          </button>

          <button onClick={toggleFullscreen} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{totalParticipants}</span>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 relative">
        <div className={`grid gap-4 h-full ${getGridClass()}`}>
          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden group">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />

            <div className="absolute bottom-3 left-3 bg-black bg-opacity-75 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
              <span>You</span>
              {!isVideoEnabled && <VideoOff className="w-3 h-3" />}
              {!isAudioEnabled && <MicOff className="w-3 h-3" />}
            </div>

            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Remote Videos */}
          {remoteStreamsArray.map(([socketId, { stream, userId }]) => {
            const participantInfo = getParticipantInfo(userId)
            return <RemoteVideo key={socketId} stream={stream} userId={userId} name={participantInfo.name} profilePicture={participantInfo.profilePicture} />
          })}

          {/* Empty slots for smaller grids */}
          {totalParticipants < 4 &&
            Array.from({ length: 4 - totalParticipants }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Waiting for others...</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Controls */}
      <div
        className={`flex items-center justify-center space-x-6 p-6 bg-gray-800 border-t border-gray-700 transition-transform duration-300 ${
          isFullscreen && !showControls ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-all duration-200 ${isAudioEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}
          title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-all duration-200 ${isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <button onClick={handleLeaveCall} className="p-4 rounded-full bg-red-600 hover:bg-red-500 transition-all duration-200 transform hover:scale-105" title="Leave call">
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

// Enhanced Remote Video Component
const RemoteVideo: React.FC<{
  stream: MediaStream
  userId: string
  name: string
  profilePicture?: string
}> = ({ stream, userId, name, profilePicture }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasVideo, setHasVideo] = useState(true)
  const [hasAudio, setHasAudio] = useState(true)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }

    // Check track states
    const videoTrack = stream.getVideoTracks()[0]
    const audioTrack = stream.getAudioTracks()[0]

    if (videoTrack) {
      setHasVideo(videoTrack.enabled)

      const handleVideoChange = () => setHasVideo(videoTrack.enabled)
      videoTrack.addEventListener('ended', () => setHasVideo(false))
      videoTrack.addEventListener('mute', () => setHasVideo(false))
      videoTrack.addEventListener('unmute', () => setHasVideo(true))

      return () => {
        videoTrack.removeEventListener('ended', handleVideoChange)
        videoTrack.removeEventListener('mute', handleVideoChange)
        videoTrack.removeEventListener('unmute', handleVideoChange)
      }
    }

    if (audioTrack) {
      setHasAudio(audioTrack.enabled)

      const handleAudioChange = () => setHasAudio(audioTrack.enabled)
      audioTrack.addEventListener('ended', () => setHasAudio(false))
      audioTrack.addEventListener('mute', () => setHasAudio(false))
      audioTrack.addEventListener('unmute', () => setHasAudio(true))

      return () => {
        audioTrack.removeEventListener('ended', handleAudioChange)
        audioTrack.removeEventListener('mute', handleAudioChange)
        audioTrack.removeEventListener('unmute', handleAudioChange)
      }
    }
  }, [stream])

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden group">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />

      <div className="absolute bottom-3 left-3 bg-black bg-opacity-75 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
        <span>{name}</span>
        {!hasVideo && <VideoOff className="w-3 h-3" />}
        {!hasAudio && <MicOff className="w-3 h-3" />}
      </div>

      {!hasVideo && (
        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
          {profilePicture ? (
            <img src={profilePicture} alt={name} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold">{name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VideoConference
