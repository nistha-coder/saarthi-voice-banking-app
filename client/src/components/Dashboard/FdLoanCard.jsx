
// ========== client/src/components/Dashboard/FdLoanCard.jsx ==========
const FdLoanCard = ({ title, items, type }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="fd-loan-list">
        {items.length === 0 ? (
          <p>No {type === 'fd' ? 'fixed deposits' : 'loans'}</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="fd-loan-item">
              <div className="item-type">{item.type}</div>
              <div className="item-amount">
                ₹{item.amount.toLocaleString('en-IN')}
              </div>
              {type === 'fd' && (
                <div className="item-details">
                  {item.interestRate}% • {new Date(item.maturityDate).toLocaleDateString()}
                </div>
              )}
              {type === 'loan' && (
                <div className="item-details">
                  Outstanding: ₹{item.outstanding.toLocaleString('en-IN')}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FdLoanCard;