import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * Drop-in Google sign-in. Renders the official Google Identity Services
 * button and handles the round-trip to our backend's /api/auth/google.
 */
export default function GoogleSignInButton({ onError }) {
  const navigate = useNavigate();
  const googleLogin = useAuthStore((s) => s.googleLogin);

  const handleSuccess = async (credentialResponse) => {
    const credential = credentialResponse?.credential;
    if (!credential) {
      onError?.('No credential returned by Google.');
      return;
    }
    const result = await googleLogin(credential);
    if (result.ok) {
      // New users go through onboarding; returning users land on the dashboard.
      navigate(result.user?.onboarding_completed ? '/dashboard' : '/onboarding');
    } else {
      onError?.(result.error);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError?.('Google sign-in was cancelled or failed.')}
        theme="filled_black"
        shape="rectangular"
        size="large"
        width="320"
        text="continue_with"
      />
    </div>
  );
}
