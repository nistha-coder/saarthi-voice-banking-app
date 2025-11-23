// ========== client/src/components/Dashboard/RemindersCard.jsx ==========
import { FaBell, FaTrash } from 'react-icons/fa';

const RemindersCard = ({ reminders = [] }) => {
  if (reminders.length === 0) {
    return (
      <div className="card reminders-card">
        <h3><FaBell /> Payment Reminders</h3>
        <div className="empty-state">
          <p>No reminders set</p>
          <p className="hint-text">
            Use the voice assistant to set reminders like:<br />
            "Remind me to pay rent on the 1st"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card reminders-card">
      <h3><FaBell /> Payment Reminders</h3>
      
      <div className="reminders-list">
        {reminders.map((reminder) => (
          <div key={reminder.id} className="reminder-item">
            <div className="reminder-icon">
              <FaBell />
            </div>
            <div className="reminder-content">
              <div className="reminder-title">
                Pay {reminder.billType}
              </div>
              <div className="reminder-date">
                {reminder.dateText}
              </div>
            </div>
            <button 
              className="btn-delete"
              onClick={() => alert('Delete reminder feature coming soon!')}
              title="Delete reminder"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .reminders-card h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--dark-color);
        }

        .empty-state {
          text-align: center;
          padding: 30px 20px;
          color: #666;
        }

        .hint-text {
          font-size: 13px;
          margin-top: 10px;
          line-height: 1.6;
        }

        .reminders-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .reminder-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid var(--warning-color);
        }

        .reminder-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--warning-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .reminder-content {
          flex: 1;
        }

        .reminder-title {
          font-weight: 600;
          color: var(--dark-color);
          margin-bottom: 4px;
        }

        .reminder-date {
          font-size: 13px;
          color: #666;
        }

        .btn-delete {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #dc3545;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-delete:hover {
          background: #fee;
        }
      `}</style>
    </div>
  );
};

export default RemindersCard;