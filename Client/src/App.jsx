import './App.css'
import { BrowserRouter, Route } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import ErrorPage from './pages/ErrorPage'
import WorkoutsPage from './pages/WorkoutsPages'
import ExerciseDetailPage from './pages/ExerciseDetailPage'
import EditWorkoutPlanPage from './pages/EditWorkoutPlanPage'
import RunWorkoutPage from './pages/RunWorkoutPage'
import WorkoutLogDetailsPage from './pages/WorkoutLogDetailsPage'
import WorkoutLogsPage from './pages/WorkoutLogsPage'


function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
          <Route path="/workout-plans/:id/edit" element={<EditWorkoutPlanPage />} />
          <Route path="/workout-plans/:id/run" element={<RunWorkoutPage />} />
          <Route path="/workout-logs" element={<WorkoutLogsPage />} />
          <Route path="/workout-logs/:id" element={<WorkoutLogDetailsPage />} />
          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
