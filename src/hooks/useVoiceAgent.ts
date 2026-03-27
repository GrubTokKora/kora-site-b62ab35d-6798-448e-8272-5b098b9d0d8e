import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioPlayer, MicStreamer } from '../lib/audioUtils';

type AgentState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';
type Message = { sender: 'user' | 'agent'; text: string };

const API_BASE_URL = (window as any).KORA_CONFIG?.apiBaseUrl || 'https://kora-agent.quseappdev.com';

export const useVoiceAgent = ({ businessId }: { businessId: string }) => {
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [assistantStreamingText, setAssistantStreamingText] = useState('');

  const ws = useRef<WebSocket | null>(null);
  const audioPlayer = useRef<AudioPlayer | null>(null);
  const micStreamer = useRef<MicStreamer | null>(null);
  const assistantTextBuffer = useRef('');

  const flushAssistantText = useCallback(() => {
    if (assistantTextBuffer.current.trim()) {
      setMessages(prev => [...prev, { sender: 'agent', text: assistantTextBuffer.current.trim() }]);
      assistantTextBuffer.current = '';
      setAssistantStreamingText('');
    }
  }, []);

  const handleServerMessage = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case 'session.updated':
        setAgentState('listening');
        micStreamer.current?.start();
        break;

      case 'conversation.item.added':
        if (data.item.input_audio_transcription?.completed) {
          flushAssistantText();
          const userText = data.item.input_audio_transcription.completed.text;
          if (userText) {
            setMessages(prev => [...prev, { sender: 'user', text: userText }]);
          }
        }
        break;

      case 'response.output_audio.delta':
        if (data.response.output_audio.delta) {
          setAgentState('speaking');
          audioPlayer.current?.enqueue(data.response.output_audio.delta);
        }
        break;

      case 'response.output_audio_transcript.delta':
        if (data.response.output_audio_transcript.delta) {
          assistantTextBuffer.current += data.response.output_audio_transcript.delta;
          setAssistantStreamingText(assistantTextBuffer.current);
        }
        break;
      
      case 'response.output_audio.done':
      case 'response.done':
        flushAssistantText();
        setAgentState('listening');
        break;

      case 'error':
        console.error('Voice agent error:', data.error);
        setAgentState('error');
        break;
    }
  }, [flushAssistantText]);

  const disconnect = useCallback(() => {
    micStreamer.current?.stop();
    micStreamer.current = null;

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    audioPlayer.current?.stop();
    audioPlayer.current = null;

    setAgentState('idle');
  }, []);

  const start = useCallback(async () => {
    if (agentState !== 'idle' && agentState !== 'error') return;

    setAgentState('connecting');
    setMessages([]);
    setAssistantStreamingText('');
    assistantTextBuffer.current = '';

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/public/voice/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: businessId }),
      });

      if (!response.ok) throw new Error('Failed to create voice session');
      
      const sessionData = await response.json();
      
      const { websocket_url, client_secret, session } = sessionData;

      if (!audioPlayer.current) {
        audioPlayer.current = new AudioPlayer(session.audio.output.format.rate);
      }
      
      if (!micStreamer.current) {
        micStreamer.current = new MicStreamer(
          (audio) => {
            if (ws.current?.readyState === WebSocket.OPEN) {
              ws.current.send(JSON.stringify({ type: 'input_audio_buffer.append', audio }));
            }
          }
        );
      }

      ws.current = new WebSocket(websocket_url, [`xai-client-secret.${client_secret}`]);

      ws.current.onopen = () => {
        ws.current?.send(JSON.stringify({ type: 'session.update', session }));
      };

      ws.current.onmessage = handleServerMessage;
      ws.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setAgentState('error');
      };
      ws.current.onclose = () => {
        if (agentState !== 'error') {
          setAgentState('idle');
        }
      };

    } catch (error) {
      console.error('Failed to start voice agent:', error);
      setAgentState('error');
    }
  }, [agentState, businessId, handleServerMessage]);

  const stop = useCallback(() => {
    disconnect();
  }, [disconnect]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { agentState, messages, assistantStreamingText, start, stop };
};