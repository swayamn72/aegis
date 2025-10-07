import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ToastConfig() {
  return <ToastContainer position="top-center" autoClose={3000} theme="dark" />;
}
