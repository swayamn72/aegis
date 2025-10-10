import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/HomePage';
import TournamentsPage from './pages/TournamentsPage';
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import PlayersPage from './pages/PlayersPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import ScrimsPage from './pages/ScrimsPage';
import ProfilePlayer from './pages/ProfilePlayer';
import DetailedPlayerProfileDN from './pages/DetailedPlayerProfileDN';
import DetailedMatchInfoDN from './pages/DetailedMatchInfoDN';
import DetailedOrgInfoDN from './pages/DetailedOrgInfoDN';
import CompleteProfilePage from './pages/CompleteProfilePage';
import MyProfilePage from './pages/MyProfilePage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import MyFeed from './pages/MyFeed';
import Tournaments2Page from './pages/Tournaments2Page';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminTournaments from './pages/AdminTournaments';
import AdminMatches from './pages/AdminMatches';
import AdminOrganizations from './pages/AdminOrganizations';
import AdminBugReports from './pages/AdminBugReports';
import CommunityPage from './pages/CommunityPage';
import CommunitiesPage from './pages/CommunitiesPage';
import CreateCommunityPage from './pages/CreateCommunityPage';
import CreatePost from './components/CreatePost';
import PostList from './components/PostList';
import NotificationsPage from './components/NotificationsPage';
import ConnectionsPage from './pages/ConnectionsPage';
import DetailedTournamentInfo2 from './components/DetailedTournamentInfo2';
import ChatPage from './pages/ChatPage';
import MyTeamsPage from './pages/MyTeamsPage';
import DetailedTeamInfo from './components/DetailedTeamInfo';
import DetailedMatchInfoBGMI from './components/DetailedMatchInfoBGMI';
import OrgDashboard from './pages/OrgDashboard';
import MyApplications from './pages/MyApplications';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <div>
    <AuthProvider>
      <AdminProvider>
        <div className="bg-slate-900 font-sans min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/createpost" element={<CreatePost/>} />
            <Route path="/postlist" element={<PostList/>} />
            <Route path="/tournaments2" element={<TournamentsPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path='/players' element={<PlayersPage />} />
            <Route path='/opportunities' element={<OpportunitiesPage />} />
            <Route path='/notifications' element={<NotificationsPage />} />
            <Route path='/connections' element={<ConnectionsPage />} />
            <Route path="/chat" element={<ChatPage  />} />
            <Route path='/scrims' element={<ScrimsPage />} />
            {/* <Route path='/profile' element={<ProfilePlayer/>} /> */}
            <Route path='/detailed/:playerId' element={<DetailedPlayerProfileDN/>} />
            <Route path='/match' element={<DetailedMatchInfoDN/>} />
            <Route path='/org' element={<DetailedOrgInfoDN/>} />
            <Route path="/myfeed" element={<MyFeed/>} />
            <Route path='/community/:communityId' element={<ProtectedRoute><CommunityPage/></ProtectedRoute>}/>
            <Route path='/communities' element={<CommunitiesPage />} />
            <Route path='/create-community' element={<CreateCommunityPage />} />
            <Route path='/complete-profile' element={<ProtectedRoute><CompleteProfilePage/></ProtectedRoute>} />
            <Route path='/my-profile' element={<ProtectedRoute><MyProfilePage/></ProtectedRoute>} />
            <Route path='/settings' element={<ProtectedRoute><SettingsPage/></ProtectedRoute>} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path='/tournaments' element={<Tournaments2Page />} />
            <Route path="/tournament/:id" element={<DetailedTournamentInfo2 />} />
            <Route path="/team/:id" element={<DetailedTeamInfo />} />
            <Route path="/matches/:id" element={<DetailedMatchInfoBGMI />} />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/tournaments" element={<AdminTournaments />} />
            <Route path="/admin/matches" element={<AdminMatches />} />
            <Route path="/admin/organizations" element={<AdminOrganizations />} />
            <Route path="/admin/bug-reports" element={<AdminBugReports />} />
            <Route path="/my-teams" element={<ProtectedRoute><MyTeamsPage /></ProtectedRoute>} />
            <Route path="/org-dashboard" element={<ProtectedRoute><OrgDashboard /></ProtectedRoute>} />
            <Route path="/my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
          </Routes>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </AdminProvider>
    </AuthProvider>
    </div>
  );
}

export default App;