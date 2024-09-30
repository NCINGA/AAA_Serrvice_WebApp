import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'primereact/resources/themes/saga-blue/theme.css'; // Theme
import 'primereact/resources/primereact.min.css'; // Core CSS
import 'primeicons/primeicons.css'; // Icons
import 'primeflex/primeflex.css'; // PrimeFlex
import "./index.css"

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App/>
)
