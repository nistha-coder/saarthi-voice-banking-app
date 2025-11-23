
// client/src/components/Layout/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import "./Navbar.css";

const API_BASE = 'http://localhost:3001/api';

const Navbar = () => {
  const [reminders, setReminders] = useState([]);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchList();
    const onStorage = (e) => {
      // if auth changed or reminders updated in other tab, re-fetch
      if (e.key === "token" || e.key === "refresh_reminders") fetchList();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchList() {
    try {
      const res = await fetch(`${API_BASE}/reminders`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await res.json();
      if (data.success) setReminders((data.reminders || []).filter(r => !r.disabled));
    } catch (e) {
      console.error("navbar reminders", e);
    }
  }

  const upcomingCount = reminders.filter(r => {
    const dt = new Date(`${r.date}T${r.time}`);
    return dt > new Date();
  }).length;

  return (
    <nav className="nav-shell">
      <div className="nav-left">
        <Link to="/dashboard" className="brand">Saarthi</Link>
      </div>

      <div className="nav-center">
        <Link to="/dashboard">Home</Link>
        <Link to="/history">History</Link>
        <Link to="/faq">AYQ</Link>
        <Link to="/reminders">Reminders</Link>
      </div>

      <div className="nav-right">
        <div className="reminder-bell-wrapper">
          <button className="reminder-bell" onClick={() => setOpen(o => !o)} title="Reminders">
            <FaBell />
            {upcomingCount > 0 && <span className="reminder-count">{upcomingCount}</span>}
          </button>

          {open && (
            <div className="reminder-dropdown">
              <div className="reminder-dropdown-head"><strong>Upcoming reminders</strong></div>
              <div className="reminder-list">
                {reminders.length === 0 && <div className="empty">No reminders</div>}
                {reminders.slice(0,6).map(r => (
                  <div className="reminder-item" key={r._id}>
                    <div className="meta">
                      <div className="title">{r.title}</div>
                      <div className="time">{r.date} {r.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="reminder-footer">
                <Link to="/reminders" onClick={() => setOpen(false)} className="view-all">Manage reminders</Link>
              </div>
            </div>
          )}
        </div>

        <Link to="/profile" className="nav-pill">N</Link>
        <Link to="/logout" className="nav-pill-outline">Logout</Link>
      </div>
    </nav>
  );
};

export default Navbar;
