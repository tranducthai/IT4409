import { useEffect, useRef, useState } from 'react';
import {
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Monitor,
  Phone,
  Users,
  Video,
  VideoOff,
} from 'lucide-react';
import { createVideoCallSocket } from '../services/api/video-call-socket.service';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

// ── Sub-components ──────────────────────────────────────────────────────────

function VideoTile({ stream, name, isLocal, isVideoEnabled, mirror = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream ?? null;
  }, [stream]);

  const showVideo = stream && (isLocal ? isVideoEnabled !== false : true);
  const initials = (name || '?')[0].toUpperCase();

  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-800">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`h-full w-full object-cover ${showVideo ? 'block' : 'hidden'} ${mirror ? '[transform:scaleX(-1)]' : ''}`}
      />
      {!showVideo && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
            {initials}
          </div>
          <span className="text-sm text-slate-300">{name}</span>
        </div>
      )}
      <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
        {name}{isLocal ? ' (Bạn)' : ''}
      </div>
    </div>
  );
}

// Keeps audio from remote streams alive when minimized (display:none mutes audio)
function HiddenAudioSink({ stream }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream ?? null;
  }, [stream]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
    />
  );
}

function MiniLocalPreview({ stream, isVideoEnabled, mirror }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream ?? null;
  }, [stream]);
  return stream && isVideoEnabled ? (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted
      className={`h-full w-full object-cover ${mirror ? '[transform:scaleX(-1)]' : ''}`}
    />
  ) : null;
}

// ── Main component ──────────────────────────────────────────────────────────

export function VideoCallModal({ classId, currentUser, onClose }) {
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState('');
  const [localStream, setLocalStream] = useState(null);      // displayed in local tile
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const socketRef = useRef(null);
  const peerConnsRef = useRef({});
  const cameraStreamRef = useRef(null);   // always the camera MediaStream
  const screenStreamRef = useRef(null);   // screen share MediaStream when active

  // ── WebRTC helpers ────────────────────────────────────────────────────────

  const createPeerConnection = (socket, remoteSocketId) => {
    if (peerConnsRef.current[remoteSocketId]) return peerConnsRef.current[remoteSocketId];

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Audio always from camera stream
    const audioTrack = cameraStreamRef.current?.getAudioTracks()[0];
    if (audioTrack && cameraStreamRef.current) {
      pc.addTrack(audioTrack, cameraStreamRef.current);
    }

    // Video: use screen if currently sharing, else camera
    const videoSrc = screenStreamRef.current || cameraStreamRef.current;
    const videoTrack = videoSrc?.getVideoTracks()[0];
    if (videoTrack && videoSrc) {
      pc.addTrack(videoTrack, videoSrc);
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socket.connected) {
        socket.emit('ice-candidate', { to: remoteSocketId, candidate: event.candidate.toJSON() });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteParticipants((prev) =>
        prev.map((p) => p.socketId === remoteSocketId ? { ...p, stream: remoteStream } : p),
      );
    };

    peerConnsRef.current[remoteSocketId] = pc;
    return pc;
  };

  const cleanup = () => {
    Object.values(peerConnsRef.current).forEach((pc) => pc.close());
    peerConnsRef.current = {};

    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;

    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    cameraStreamRef.current = null;

    socketRef.current?.disconnect();
    socketRef.current = null;

    setLocalStream(null);
    setRemoteParticipants([]);
  };

  // ── Signaling init ────────────────────────────────────────────────────────

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!isMounted) { stream.getTracks().forEach((t) => t.stop()); return; }

        cameraStreamRef.current = stream;
        setLocalStream(stream);

        const socket = createVideoCallSocket();
        if (!socket) throw new Error('Không thể tạo kết nối socket');
        socketRef.current = socket;

        socket.on('call-joined', async ({ participants }) => {
          if (!isMounted) return;
          setRemoteParticipants(participants.map((p) => ({ ...p, stream: null })));
          for (const p of participants) {
            const pc = createPeerConnection(socket, p.socketId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('offer', { to: p.socketId, sdp: offer });
          }
          if (isMounted) setStatus('connected');
        });

        socket.on('user-joined', (participant) => {
          if (!isMounted) return;
          setRemoteParticipants((prev) => {
            if (prev.find((p) => p.socketId === participant.socketId)) return prev;
            return [...prev, { ...participant, stream: null }];
          });
        });

        socket.on('user-left', ({ socketId }) => {
          if (!isMounted) return;
          peerConnsRef.current[socketId]?.close();
          delete peerConnsRef.current[socketId];
          setRemoteParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
        });

        socket.on('offer', async ({ from, sdp }) => {
          if (!isMounted) return;
          setRemoteParticipants((prev) =>
            prev.find((p) => p.socketId === from)
              ? prev
              : [...prev, { socketId: from, name: '...', userId: '', stream: null }],
          );
          const pc = createPeerConnection(socket, from);
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { to: from, sdp: answer });
        });

        socket.on('answer', async ({ from, sdp }) => {
          if (!isMounted) return;
          const pc = peerConnsRef.current[from];
          if (pc && pc.signalingState !== 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          }
        });

        socket.on('ice-candidate', async ({ from, candidate }) => {
          if (!isMounted) return;
          const pc = peerConnsRef.current[from];
          if (pc) {
            try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch { /* stale */ }
          }
        });

        await new Promise((resolve, reject) => {
          socket.once('connect', resolve);
          socket.once('connect_error', (err) => reject(err));
          setTimeout(() => reject(new Error('Kết nối timeout')), 8000);
          socket.connect();
        });

        socket.emit('join-call', {
          classId,
          name: currentUser?.full_name || currentUser?.email || 'Unknown',
        });

        if (isMounted) setStatus('connected');
      } catch (err) {
        if (isMounted) { setStatus('error'); setError(err?.message || 'Không thể tham gia cuộc gọi'); }
        cleanup();
      }
    };

    void init();

    return () => {
      isMounted = false;
      if (socketRef.current?.connected) socketRef.current.emit('leave-call', classId);
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Controls ──────────────────────────────────────────────────────────────

  const toggleAudio = () => {
    const track = cameraStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsAudioEnabled(track.enabled); }
  };

  const toggleVideo = () => {
    const track = cameraStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsVideoEnabled(track.enabled); }
  };

  const restoreCamera = () => {
    const cameraVideoTrack = cameraStreamRef.current?.getVideoTracks()[0];
    if (cameraVideoTrack) {
      Object.values(peerConnsRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(cameraVideoTrack);
      });
    }
    setLocalStream(cameraStreamRef.current);
    setIsScreenSharing(false);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      restoreCamera();
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });

      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace video track in all active peer connections
      Object.values(peerConnsRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
      });

      setLocalStream(screenStream);
      setIsScreenSharing(true);

      // Handle browser's native "Stop sharing" button
      screenTrack.onended = () => {
        screenStreamRef.current = null;
        restoreCamera();
      };
    } catch {
      // User cancelled — ignore
    }
  };

  const handleEndCall = () => {
    if (socketRef.current?.connected) socketRef.current.emit('leave-call', classId);
    cleanup();
    onClose();
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const allTiles = [
    { socketId: 'local', name: currentUser?.full_name || 'Bạn', stream: localStream, isLocal: true },
    ...remoteParticipants,
  ];

  const gridClass =
    allTiles.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto'
    : allTiles.length <= 4 ? 'grid-cols-2'
    : 'grid-cols-3';

  const localMirror = !isScreenSharing;

  // ── Minimized view ────────────────────────────────────────────────────────

  if (isMinimized) {
    return (
      <>
        {/* Hidden sinks to keep remote audio alive */}
        {remoteParticipants.map((p) => (
          <HiddenAudioSink key={p.socketId} stream={p.stream} />
        ))}

        <div className="fixed bottom-5 right-5 z-50 w-72 overflow-hidden rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-white/10">
          {/* Local preview */}
          <div className="relative aspect-video overflow-hidden bg-slate-800">
            <MiniLocalPreview stream={localStream} isVideoEnabled={isVideoEnabled} mirror={localMirror} />
            {(!localStream || !isVideoEnabled) && (
              <div className="flex h-full items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">
                  {(currentUser?.full_name || '?')[0].toUpperCase()}
                </div>
              </div>
            )}

            {/* Restore button */}
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              title="Phóng to"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>

            {/* Screen share badge */}
            {isScreenSharing && (
              <div className="absolute left-2 top-2 rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                Đang chia sẻ
              </div>
            )}
          </div>

          {/* Mini controls */}
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="text-xs text-slate-400">
              {allTiles.length} người · {status === 'connecting' ? 'Đang kết nối...' : 'Đang gọi'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAudio}
                className={`flex h-8 w-8 items-center justify-center rounded-full ${isAudioEnabled ? 'bg-slate-700 text-white' : 'bg-rose-600 text-white'}`}
              >
                {isAudioEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleEndCall}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-700"
              >
                <Phone className="h-3.5 w-3.5 rotate-[135deg]" />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Full-screen view ──────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white">Cuộc gọi video</span>
          {isScreenSharing && (
            <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-medium text-white">
              Đang chia sẻ màn hình
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          title="Thu nhỏ"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-white hover:bg-slate-600"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video grid */}
        <div className="flex flex-1 items-center justify-center overflow-auto p-4">
          {status === 'connecting' && (
            <p className="text-slate-400">Đang kết nối...</p>
          )}
          {status === 'error' && (
            <div className="text-center">
              <p className="text-rose-400">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
              >
                Đóng
              </button>
            </div>
          )}
          {status === 'connected' && (
            <div className={`grid w-full gap-3 ${gridClass}`}>
              {allTiles.map((tile) => (
                <VideoTile
                  key={tile.socketId}
                  stream={tile.stream}
                  name={tile.name}
                  isLocal={tile.isLocal}
                  isVideoEnabled={tile.isLocal ? isVideoEnabled : undefined}
                  mirror={tile.isLocal && localMirror}
                />
              ))}
            </div>
          )}
        </div>

        {/* Participants panel */}
        {showParticipants && (
          <div className="w-60 shrink-0 overflow-y-auto border-l border-slate-700 bg-slate-900">
            <div className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-300">
                Thành viên ({allTiles.length})
              </h3>
              <div className="space-y-1">
                {allTiles.map((p) => (
                  <div
                    key={p.socketId}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-800"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                      {(p.name || '?')[0].toUpperCase()}
                    </div>
                    <span className="truncate text-sm text-slate-200">
                      {p.name}{p.isLocal ? ' (Bạn)' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between border-t border-slate-700 px-6 py-4">
        {/* Left group: mic + camera + screen share */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleAudio}
            title={isAudioEnabled ? 'Tắt mic' : 'Bật mic'}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${isAudioEnabled ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={toggleVideo}
            title={isVideoEnabled ? 'Tắt camera' : 'Bật camera'}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${isVideoEnabled ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={toggleScreenShare}
            title={isScreenSharing ? 'Dừng chia sẻ màn hình' : 'Chia sẻ màn hình'}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${isScreenSharing ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
          >
            <Monitor className="h-5 w-5" />
          </button>
        </div>

        {/* Center: end call */}
        <button
          type="button"
          onClick={handleEndCall}
          title="Kết thúc cuộc gọi"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white transition-colors hover:bg-rose-700"
        >
          <Phone className="h-6 w-6 rotate-[135deg]" />
        </button>

        {/* Right group: participants */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowParticipants((v) => !v)}
            title="Danh sách thành viên"
            className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-colors ${showParticipants ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
          >
            <Users className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-500 text-[10px] font-bold text-white">
              {allTiles.length}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
