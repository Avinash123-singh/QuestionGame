import { useState, useRef, useEffect, useCallback } from 'react';

export function useVoiceChat({ sendVoice, subscribeVoice, myPlayerId, incomingMuted }) {
  const [micMuted, setMicMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!subscribeVoice) return undefined;
    return subscribeVoice((data) => {
      if (incomingMuted || data.playerId === myPlayerId) return;
      try {
        const audio = new Audio(data.audio);
        audio.play().catch(() => {});
      } catch {
        // playback failed
      }
    });
  }, [subscribeVoice, incomingMuted, myPlayerId]);

  const ensureStream = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    return stream;
  }, []);

  const startTalking = useCallback(async () => {
    if (micMuted || !sendVoice) return;
    setMicError(null);
    try {
      const stream = await ensureStream();
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          sendVoice(reader.result, recorder.mimeType);
        };
        reader.readAsDataURL(blob);
        setIsRecording(false);
      };
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setMicError('Microphone access denied');
    }
  }, [micMuted, sendVoice, ensureStream]);

  const stopTalking = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  return {
    micMuted,
    setMicMuted,
    isRecording,
    micError,
    startTalking,
    stopTalking,
  };
}
