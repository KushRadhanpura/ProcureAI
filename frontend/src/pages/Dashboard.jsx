// src/pages/Dashboard.jsx
const Dashboard = ({ user }) => {
  return (
    <div className="flex">
      {/* Sidebar - Conditional Rendering */}
      <aside className="w-64 p-6 bg-gray-100 h-screen">
        <h2 className="font-bold">Menu</h2>
        {user.role === 'Owner' && <div><p>Employee List</p><p>Cost Analytics</p></div>}
        <p>Items List</p>
      </aside>

      {/* Main Area */}
      <main className="p-10">
        <h1>Welcome, {user.name} ({user.role})</h1>
        {/* Role specific actions */}
        {user.role === 'Validator' && <button>Validate AI Draft</button>}
      </main>
    </div>
  );
};