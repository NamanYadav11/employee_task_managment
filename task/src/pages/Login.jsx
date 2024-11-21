// src/Login.jsx
import { useState } from 'react'
import { useFrappeAuth } from 'frappe-react-sdk'
import { useNavigate } from 'react-router-dom'



function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const[loginError,setLoginError] = useState('')

  const{currentUser,login,isLoading}=useFrappeAuth();
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    // Here you can add your authentication logic
    
    login({
      username:username,
      password:password
    }).then(res=>{
      console.log(res)
      setLoginError(undefined)
      navigate("/home")
    }).catch(err=>{
      setLoginError(err)
    })
    
  }



  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            {console.log(loginError.message)}
            {loginError?<h1 className='bg-red-300 p-2 rounded-md mb-2'>{loginError.message}</h1>:null}
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
            disabled={isLoading}
            
          >
            Login
          </button>

        </form>
      </div>
    </div>
  )
}

export default Login
