
import { useState, useRef } from "react";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * FIXED VoiceRecorder Component
 * - No ghost samples
 * - Clean reset
 * - Proper re-record logic
 * - Proper auto-stop
 */
const VoiceRecorder = ({ onRecordComplete, mode = "enrollment" }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      setError("");
      setRecordedBlob(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);

        // Only send NON-null blobs
        if (blob.size > 500) {
          onRecordComplete(blob);
        }

        stopStream();
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 5 sec
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          stopRecording();
        }
      }, 5000);
    } catch (err) {
      setError("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  };

  const recordAgain = () => {
    setRecordedBlob(null);
    setError("");
    chunksRef.current = [];
    onRecordComplete(null); // Remove old sample
  };

  return (
    <div className="voice-recorder">
      <div className="voice-recorder-container">
        <h3>{mode === "enrollment" ? t("auth.voiceEnrollment") : t("auth.voiceVerification")}</h3>

        {mode === "enrollment" && (
          <p className="instruction-text">
            Please say a full sentence clearly, like:
            <br />
            <strong>"My voice is my password, verify me"</strong>
          </p>
        )}

        {error && <div className="error-message">{error}</div>}

        {!recordedBlob ? (
          <div className="recording-controls">
            <div className={`mic-icon ${isRecording ? "recording" : ""}`}>
              🎤
            </div>

            <div className="recording-status">
              {isRecording ? (
                <>
                  <div className="pulse-indicator"></div>
                  <p className="status-text">Listening...</p>
                  <p className="status-subtext">Recording... auto-stop in 5 sec</p>
                </>
              ) : (
                <p className="status-text">{t("auth.recordVoice")}</p>
              )}
            </div>

            <button
              type="button"
              onClick={startRecording}
              className="btn-record"
              disabled={isRecording}
            >
              {isRecording ? "Recording..." : t("auth.startRecording")}
            </button>
          </div>
        ) : (
          <div className="recording-complete">
            <div className="checkmark">✓</div>
            <p className="success-text">{t("auth.voiceRecorded")}</p>

            <button type="button" onClick={recordAgain} className="btn-secondary">
              Record Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
