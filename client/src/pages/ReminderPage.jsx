// client/src/pages/ReminderPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { FaPlus, FaTrash, FaMicrophone, FaTimes } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../utils/constants";
import Navbar from "../components/Layout/Navbar";
import VoiceAssistantMic from "../components/Core/VoiceAssistantMic";
import "./RemindersPage.css";

const STORAGE_KEY = "saarthi_reminders_v1";
const uidGen = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const toDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

function urlBase64ToUint8Array(base64String) {
  // helper for VAPID key
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function ReminderPage() {
  const { user } = useAuth(); // expects user.userId or similar
  const currentUserId = user?.userId || user?._id || user?.id || "demo-user";

  const [reminders, setReminders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [frequency, setFrequency] = useState("one-time");

  // speech recognition refs (per field)
  const recogRef = useRef({});
  // timeouts for scheduling reminders
  const timeoutsRef = useRef({});

  // load saved reminders (local as fallback)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setReminders(JSON.parse(raw));
    } catch {
      setReminders([]);
    }
  }, []);

  // persist + schedule on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));

    // clear previous timeouts
    Object.values(timeoutsRef.current).forEach((t) => clearTimeout(t));
    timeoutsRef.current = {};

    // schedule active reminders
    reminders.forEach((r) => scheduleReminder(r));

    // notify other tabs (navbar sync)
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: JSON.stringify(reminders) }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders]);

  // Request Notification permission once (use before subscribing)
  const ensureNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {}
    }
  };

  // register SW + subscribe to push, then POST to backend
  const registerServiceWorkerAndSubscribe = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications or Service Worker not supported in this browser.");
      return;
    }

    try {
      // fetch public VAPID key from backend
      const r = await fetch(`${API_BASE_URL}/vapidPublicKey`);
      if (!r.ok) {
        console.error("Failed to fetch vapid key", await r.text());
        return;
      }
      const { publicKey } = await r.json();
      if (!publicKey) {
        console.error("No VAPID public key returned from server");
        return;
      }

      // register service worker (public/sw.js)
      const reg = await navigator.serviceWorker.register("/sw.js");
      console.log("Service worker registered:", reg);

      // get existing subscription or subscribe
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      // send to backend
      const postRes = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, subscription: sub }),
      });
      if (!postRes.ok) {
        const txt = await postRes.text();
        console.error("Subscription register failed:", postRes.status, txt);
      } else {
        console.log("Subscription registered on server");
      }
    } catch (err) {
      console.error("Push subscription/register error:", err);
    }
  };

  // run subscription on mount (if user logged in)
  useEffect(() => {
    (async () => {
      await ensureNotificationPermission();
      // Only attempt push registration if the user is logged in (or demo-user still ok)
      if (currentUserId) {
        registerServiceWorkerAndSubscribe();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const resetForm = () => {
    setTitle("");
    setDate("");
    setTime("");
    setNote("");
    setFrequency("one-time");
  };

  const openAddModal = async () => {
    await ensureNotificationPermission();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    stopAllSpeech();
    resetForm();
  };

  const addReminder = (e) => {
    e && e.preventDefault();
    if (!title.trim() || !date || !time) {
      alert("Please add title, date and time");
      return;
    }
    const dt = toDateTime(date, time);
    if (!dt || isNaN(dt.getTime())) {
      alert("Invalid date or time");
      return;
    }
    const r = {
      id: uidGen(),
      title: title.trim(),
      date,
      time,
      note: note.trim(),
      frequency,
      disabled: false,
      createdAt: new Date().toISOString(),
    };
    setReminders((p) => [r, ...p]);
    closeModal();
  };

  const deleteReminder = (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    setReminders((p) => p.filter((r) => r.id !== id));
  };

  // trigger notification + recurrence handling
  const triggerReminder = (r) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(r.title, {
        body: r.note || `Reminder at ${r.time}`,
        icon: "/favicon.ico",
      });
    } else {
      console.info("Reminder:", r.title);
    }

    if (r.frequency === "daily" || r.frequency === "weekly") {
      const base = toDateTime(r.date, r.time);
      const next = new Date(base);
      next.setDate(next.getDate() + (r.frequency === "daily" ? 1 : 7));
      const updated = { ...r, date: next.toISOString().slice(0, 10) };
      setReminders((prev) => prev.map((it) => (it.id === r.id ? updated : it)));
    } else {
      setReminders((prev) => prev.map((it) => (it.id === r.id ? { ...it, disabled: true } : it)));
    }
  };

  // schedule with setTimeout (best-effort while page open)
  const scheduleReminder = (r) => {
    if (r.disabled) return;
    const dt = toDateTime(r.date, r.time);
    if (!dt) return;
    const diff = dt.getTime() - Date.now();
    if (diff <= 0) return;
    const MAX = 2147483647;
    if (diff > MAX) {
      timeoutsRef.current[r.id] = setTimeout(() => scheduleReminder(r), MAX);
      return;
    }
    timeoutsRef.current[r.id] = setTimeout(() => triggerReminder(r), diff);
  };

  // --- Speech recognition helpers (Title & Note only) ---
  const startSpeech = (field) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    // toggle
    if (recogRef.current[field]) {
      recogRef.current[field].stop();
      delete recogRef.current[field];
      return;
    }
    const rec = new SpeechRecognition();
    // set language if you keep a language context; default to en-US
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev) => {
      const text = ev.results[0][0].transcript;
      if (field === "title") setTitle((p) => (p ? p + " " + text : text));
      if (field === "note") setNote((p) => (p ? p + " " + text : text));
    };
    rec.onerror = () => {
      // ignore or show UI
    };
    rec.onend = () => {
      delete recogRef.current[field];
    };
    recogRef.current[field] = rec;
    rec.start();
  };

  const stopAllSpeech = () => {
    Object.values(recogRef.current).forEach((r) => r?.stop?.());
    recogRef.current = {};
  };

  return (
    <>
      <Navbar />
      <VoiceAssistantMic />

      <main className="reminder-page-root">
        <div className="reminder-ornament" aria-hidden style={{ opacity: 0.06 }} />
        <div className="floating-shapes" aria-hidden>
          <div className="fshape s1" />
          <div className="fshape s2" />
          <div className="fshape s3" />
        </div>

        <section className="reminder-header">
          <div>
            <h1>Reminders</h1>
            <p className="muted">Create reminders by typing or using your voice. We'll notify you at the set time.</p>
          </div>

          <div className="header-actions">
            <button className="btn-gradient" onClick={openAddModal}>
              <FaPlus /> Add Reminder
            </button>
          </div>
        </section>

        <section className="reminder-grid">
          <div className="reminder-list">
            {reminders.length === 0 && (
              <div className="empty-state">
                <h3>No reminders yet</h3>
                <p>Click <strong>Add Reminder</strong> to create one — you can use the mic inside the form for title/note.</p>
              </div>
            )}

            {reminders.map((r) => (
              <article key={r.id} className={`reminder-card ${r.disabled ? "disabled" : ""}`}>
                <div className="card-top">
                  <div className="card-title">{r.title}</div>
                  <button className="icon-btn delete" onClick={() => deleteReminder(r.id)} title="Delete">
                    <FaTrash />
                  </button>
                </div>

                <div className="card-meta">
                  <span className="meta-pill">{r.date}</span>
                  <span className="meta-pill">{r.time}</span>
                  {r.frequency !== "one-time" && <span className="meta-pill">{r.frequency}</span>}
                </div>

                {r.note && <div className="card-note">{r.note}</div>}
              </article>
            ))}
          </div>

          <aside className="reminder-sidebar">
            <div className="side-card">
              <h4>Quick tips</h4>
              <ul>
                <li>Use the mic in the form to speak the reminder title or note.</li>
                <li>Recurring reminders: daily or weekly.</li>
                <li>Background push notifications require subscription & permission.</li>
              </ul>
            </div>

            <div className="side-card">
              <h4>Actions</h4>
              <button className="btn-ghost" onClick={() => { setReminders([]); localStorage.removeItem(STORAGE_KEY); }}>
                Clear all reminders
              </button>
            </div>
          </aside>
        </section>

        {/* Modal */}
        {modalOpen && (
  <div className="modal-root" onClick={(e) => e.target === e.currentTarget && closeModal()}>
    <div className="modal-card">

      <div className="modal-header">
        <h3>Add Reminder</h3>
        <button className="icon-btn close" onClick={closeModal}><FaTimes /></button>
      </div>

      <form className="modal-form" onSubmit={addReminder}>
        <label>Task Title*</label>
        <div className="field-with-mic">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Pay electricity bill"
          />
          <button type="button" className="mic-btn" onClick={() => startSpeech("title")}>
            <FaMicrophone />
          </button>
        </div>

        <label>Reminder Date*</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label>Reminder Time*</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

        <label>Note (optional)</label>
        <div className="field-with-mic">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} />
          <button type="button" className="mic-btn" onClick={() => startSpeech("note")}>
            <FaMicrophone />
          </button>
        </div>

        <label>Reminder Frequency*</label>
        <div className="freq-row">
          <label><input type="radio" checked={frequency === "one-time"} onChange={() => setFrequency("one-time")} /> One-time</label>
          <label><input type="radio" checked={frequency === "daily"} onChange={() => setFrequency("daily")} /> Daily</label>
          <label><input type="radio" checked={frequency === "weekly"} onChange={() => setFrequency("weekly")} /> Weekly</label>
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn-gradient">Save</button>
          <button type="button" className="btn-ghost" onClick={closeModal}>Clear</button>
        </div>
      </form>
    </div>
  </div>
)}

      </main>
    </>
  );
}


