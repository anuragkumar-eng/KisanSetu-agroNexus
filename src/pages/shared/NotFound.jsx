// 404 Not Found page
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl mb-4">🌾</p>
      <h1 className="text-4xl font-bold text-green-700 mb-2">404</h1>
      <p className="text-xl font-semibold text-gray-700 mb-1">पेज नहीं मिला</p>
      <p className="text-gray-500 mb-8 max-w-xs">
        यह पेज मौजूद नहीं है। / This page does not exist.
      </p>
      <Button variant="primary" size="lg" onClick={() => navigate(-1)}>
        ← वापस जाएँ
      </Button>
    </div>
  );
}
