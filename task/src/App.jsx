import { FrappeProvider } from 'frappe-react-sdk'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Error from './pages/Error'

function App() {

	const router = createBrowserRouter([
		{
			path:'/',
			element:<Login/>,
			errorElement:<Error/>
		},
		{
			path:'/home',
			element:<Dashboard/>,
			errorElement:<Error/>
		}
	],
		{
			future: {
				v7_skipActionErrorRevalidation: true,
			},
	  }
	)
	

  return (
	<div className="App">
	  <FrappeProvider
	  	socketPort={import.meta.env.VITE_SOCKET_PORT}
	  >

		<RouterProvider router = {router}/>
	  </FrappeProvider>
	</div>
  )
}

export default App
