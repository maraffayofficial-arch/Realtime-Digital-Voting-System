import React, { useState, useEffect } from 'react';
import { UserCircle, Vote, Users, Lock, LogOut, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:9000';

// API Helper Functions
const api = {
  signup: (data) => fetch(`${API_BASE_URL}/user/sign-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  signin: (data) => fetch(`${API_BASE_URL}/user/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  getProfile: (token) => fetch(`${API_BASE_URL}/user/myprofile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  updatePassword: (token, data) => fetch(`${API_BASE_URL}/user/update-password`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  }),
  getCandidates: () => fetch(`${API_BASE_URL}/candidate/list`),
  getVoteCounts: () => fetch(`${API_BASE_URL}/candidate/vote-counts`),
  vote: (token, candidateId) => fetch(`${API_BASE_URL}/candidate/vote/${candidateId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  createCandidate: (token, data) => fetch(`${API_BASE_URL}/candidate/createCandidate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  }),
  updateCandidate: (token, candidateId, data) => fetch(`${API_BASE_URL}/candidate/updateCandidate/${candidateId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  }),
  deleteCandidate: (token, candidateId) => fetch(`${API_BASE_URL}/candidate/deleteCandidate/${candidateId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
};

// Auth Context
const AuthContext = React.createContext();

function ProfileSection() {
  const { user, token } = React.useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await api.updatePassword(token, { oldpassword: oldPassword, newpassword: newPassword });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
      } else {
        setMessage(data.message || 'Failed to update password');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="text-sm font-medium text-gray-600">Name</label>
          <p className="text-lg text-gray-800">{user?.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Email</label>
          <p className="text-lg text-gray-800">{user?.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">CNIC</label>
          <p className="text-lg text-gray-800">{user?.cnic}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Age</label>
          <p className="text-lg text-gray-800">{user?.age}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Role</label>
          <p className="text-lg text-gray-800 capitalize">{user?.role}</p>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Change Password</h3>
        
        {message && (
          <div className={`${message.includes('success') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-lg mb-4`}>
            {message}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentPage, setCurrentPage] = useState('login');

  useEffect(() => {
    if (token) {
      loadUserProfile();
    }
  }, [token]);

  const loadUserProfile = async () => {
    try {
      const res = await api.getProfile(token);
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setCurrentPage(data.user.role === 'admin' ? 'admin' : 'voter');
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const login = (userData, authToken) => {
    setToken(authToken);
    localStorage.setItem('token', authToken);
    setUser(userData);
    setCurrentPage(userData.role === 'admin' ? 'admin' : 'voter');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setCurrentPage('login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setCurrentPage }}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {!token ? (
          currentPage === 'login' ? <LoginPage /> : <SignupPage />
        ) : user?.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <VoterDashboard />
        )}
      </div>
    </AuthContext.Provider>
  );
}

function LoginPage() {
  const { login, setCurrentPage } = React.useContext(AuthContext);
  const [cnic, setCnic] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.signin({ cnic, password });
      const data = await res.json();
      
      if (res.ok) {
        login(data.userResponse, data.userResponse.token);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Vote className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-center text-gray-600 mb-8">Sign in to cast your vote</p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CNIC (13 digits)</label>
            <input
              type="text"
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
              placeholder="1234567890123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              pattern="\d{13}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <button onClick={() => setCurrentPage('signup')} className="text-indigo-600 font-semibold hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

function SignupPage() {
  const { login, setCurrentPage } = React.useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cnic: '',
    age: '',
    password: '',
    role: 'voter'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.signup({ ...formData, age: parseInt(formData.age) });
      const data = await res.json();
      
      if (res.ok) {
        login(data.userResponse, data.userResponse.token);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Create Account</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="CNIC (13 digits)"
            value={formData.cnic}
            onChange={(e) => setFormData({...formData, cnic: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
            pattern="\d{13}"
          />
          <input
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="voter">Voter</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <button onClick={() => setCurrentPage('login')} className="text-indigo-600 font-semibold hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

function VoterDashboard() {
  const { user, token, logout, setCurrentPage } = React.useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [voteCounts, setVoteCounts] = useState([]);
  const [activeTab, setActiveTab] = useState('vote');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCandidates();
    loadVoteCounts();
  }, []);

  const loadCandidates = async () => {
    try {
      const res = await api.getCandidates();
      const data = await res.json();
      if (res.ok) setCandidates(data.candidateDetails);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    }
  };

  const loadVoteCounts = async () => {
    try {
      const res = await api.getVoteCounts();
      const data = await res.json();
      if (res.ok) setVoteCounts(data.candidateDetails);
    } catch (error) {
      console.error('Failed to load vote counts:', error);
    }
  };

  const handleVote = async (candidateId) => {
    if (user.isvoted) {
      setMessage('You have already voted!');
      return;
    }

    setLoading(true);
    try {
      const res = await api.vote(token, candidateId);
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Vote recorded successfully!');
        user.isvoted = true;
        loadVoteCounts();
      } else {
        setMessage(data.message || 'Failed to vote');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Vote className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Voting Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">{user?.name}</span>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-red-600 hover:text-red-700">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('vote')}
            className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'vote' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Cast Vote
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'results' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Vote Results
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Profile
          </button>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        {activeTab === 'vote' && (
          <div>
            {user?.isvoted && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                You have already cast your vote!
              </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((candidate) => (
                <div key={candidate.candidateId} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{candidate.name}</h3>
                  <p className="text-gray-600 mb-4">Party: {candidate.party}</p>
                  <button
                    onClick={() => handleVote(candidate.candidateId)}
                    disabled={user?.isvoted || loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {user?.isvoted ? 'Already Voted' : 'Vote'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Standings</h2>
            <div className="space-y-4">
              {voteCounts.map((candidate, index) => (
                <div key={candidate.candidateId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-indigo-600">#{index + 1}</span>
                    <div>
                      <h3 className="font-bold text-gray-800">{candidate.name}</h3>
                      <p className="text-sm text-gray-600">{candidate.party}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{candidate.votecounts}</p>
                    <p className="text-sm text-gray-600">votes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && <ProfileSection />}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { user, token, logout } = React.useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [voteCounts, setVoteCounts] = useState([]);
  const [activeTab, setActiveTab] = useState('manage');
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [formData, setFormData] = useState({ name: '', age: '', party: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCandidates();
    loadVoteCounts();
  }, []);

  const loadCandidates = async () => {
    try {
      const res = await api.getCandidates();
      const data = await res.json();
      if (res.ok) setCandidates(data.candidateDetails);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    }
  };

  const loadVoteCounts = async () => {
    try {
      const res = await api.getVoteCounts();
      const data = await res.json();
      if (res.ok) setVoteCounts(data.candidateDetails);
    } catch (error) {
      console.error('Failed to load vote counts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editingCandidate
        ? await api.updateCandidate(token, editingCandidate.candidateId, { ...formData, age: parseInt(formData.age) })
        : await api.createCandidate(token, { ...formData, age: parseInt(formData.age) });
      
      const data = await res.json();
      if (res.ok) {
        setMessage(editingCandidate ? 'Candidate updated!' : 'Candidate created!');
        setShowForm(false);
        setEditingCandidate(null);
        setFormData({ name: '', age: '', party: '' });
        loadCandidates();
        loadVoteCounts();
      } else {
        setMessage(data.message || 'Operation failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  const handleEdit = (candidate) => {
    setEditingCandidate(candidate);
    setFormData({ name: candidate.name, age: candidate.age || '', party: candidate.party });
    setShowForm(true);
  };

  const handleDelete = async (candidateId) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    
    try {
      await api.deleteCandidate(token, candidateId);
      setMessage('Candidate deleted!');
      loadCandidates();
      loadVoteCounts();
    } catch (error) {
      setMessage('Failed to delete candidate');
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">{user?.name}</span>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-red-600 hover:text-red-700">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'manage' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Manage Candidates
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'results' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Vote Results
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Profile
          </button>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        {activeTab === 'manage' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Candidates</h2>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingCandidate(null);
                  setFormData({ name: '', age: '', party: '' });
                }}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5" />
                Add Candidate
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">{editingCandidate ? 'Edit Candidate' : 'New Candidate'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Party"
                    value={formData.party}
                    onChange={(e) => setFormData({...formData, party: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                      {editingCandidate ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingCandidate(null);
                        setFormData({ name: '', age: '', party: '' });
                      }}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((candidate) => (
                <div key={candidate.candidateId} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{candidate.name}</h3>
                  <p className="text-gray-600 mb-4">Party: {candidate.party}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(candidate)}
                      className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(candidate.candidateId)}
                      className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Vote Results</h2>
            <div className="space-y-4">
              {voteCounts.map((candidate, index) => (
                <div key={candidate.candidateId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-indigo-600">#{index + 1}</span>
                    <div>
                      <h3 className="font-bold text-gray-800">{candidate.name}</h3>
                      <p className="text-sm text-gray-600">{candidate.party}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{candidate.votecounts}</p>
                    <p className="text-sm text-gray-600">votes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && <ProfileSection />}
      </div>
    </div>
  );
}

export default App;