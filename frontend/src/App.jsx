import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage  from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import HomePage from "./pages/home/HomePage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/notificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";
import {useQuery} from "@tanstack/react-query"
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {

  const {data:authUser,isLoading} = useQuery({
    //Use queryKey to give a unique name to our query and refer later
    queryKey:['authUser'],
    queryFn:async() =>{
      try {
        // const res = await fetch ("/api/auth/me")
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`)
        const data =await res.json()

        if(data.error) return null

        if(!res.ok){
          throw new Error (error || "Something went wrong")
        }

        console.log("authUser is here", data)
        return data;

      } catch (error) {
        throw new Error(error)
        
      }
    },
    retry:false
  })

  if(isLoading) {
    return(
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size ="lg" />

      </div>
    )
  }

  return (
    
    <div className='flex max-w-6xl mx-auto'>

      {/* Common Component */}
      {/* //only show sidebar when user is authenticated */}
      { authUser && <Sidebar /> }
      <Routes>

        <Route path ="/" element = {authUser? <HomePage /> : <Navigate to = "/login" />} />
        <Route path = "/login" element ={!authUser? <LoginPage /> : <Navigate to = "/" />} />
        <Route path = "/signup" element ={!authUser? <SignUpPage /> : <Navigate to = "/" />} /> 
        <Route path = "/notifications" element = { authUser? <NotificationPage /> : <Navigate to = "/" /> } />
        <Route path = "/profile/:username" element = { authUser? <ProfilePage /> : <Navigate to = "/" /> } />

      </Routes>
      {/* //only show right panel when user is authenticated */}
      {authUser && <RightPanel />}
      <Toaster />
     
      
      
    </div>
    
  );
}

export default App;
