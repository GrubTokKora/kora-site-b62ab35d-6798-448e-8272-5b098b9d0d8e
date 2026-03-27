import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useVoiceAgent } from '../hooks/useVoiceAgent';
import MicIcon from './icons/MicIcon';
import StopIcon from './icons/StopIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import XIcon from './icons/XIcon';

const BUSINESS_ID = window.KORA_SITE?.businessId || "b62ab35d-6798-448e-8272-5b098b9d0d8e";

const VoiceAgentWidget: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWidget, setShowWidget] = useState(false);

  const {
    agentState,
    messages,
    assistantStreamingText,
    start,
    stop,
  } = useVoiceAgent({ businessId: BUSINESS_ID });

  useEffect(() => {
    // The decision to show the widget is based on the runtime config
    // injected into index.html by the backend.
    if ((window as any).KORA_CONFIG?.features?.voice?.enabled === true) {
      setShowWidget(true);
    }
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
    start();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    stop();
  };

  if (!showWidget) {
    return null;
  }

  const getStatusText = () => {
    switch (agentState) {
      case 'idle':
        return 'Click the button to start speaking.';
      case 'connecting':
        return 'Connecting...';
      case 'listening':
        return 'Listening...';
      case 'speaking':
        return 'Assistant is speaking...';
      case 'error':
        return 'An error occurred. Please try again.';
      default:
        return '';
    }
  };

  return (
    <>
      <button className="voice-agent-fab" onClick={openModal} aria-label="Open Voice Assistant">
        <MicIcon />
      </button>

      <div className={`voice-agent-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
        <div className="voice-agent-modal" onClick={(e) => e.stopPropagation()}>
          <header className="voice-agent-header">
            <h3>Voice Assistant</h3>
            <button className="voice-agent-close-btn" onClick={closeModal} aria-label="Close">
              <XIcon />
            </button>
          </header>
          <div className="voice-agent-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`voice-agent-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {assistantStreamingText && (
              <div className="voice-agent-message agent">
                {assistantStreamingText}
              </div>
            )}
          </div>
          <footer className="voice-agent-footer">
            <p className="voice-agent-status">{getStatusText()}</p>
            <button
              className={`voice-agent-mic-btn ${agentState}`}
              onClick={agentState === 'listening' ? stop : start}
              disabled={agentState === 'connecting' || agentState === 'speaking'}
              aria-label={agentState === 'listening' ? 'Stop Recording' : 'Start Recording'}
            >
              {agentState === 'connecting' && <SpinnerIcon />}
              {agentState === 'listening' && <StopIcon />}
              {(agentState === 'idle' || agentState === 'speaking' || agentState === 'error') && <MicIcon />}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default VoiceAgentWidget;