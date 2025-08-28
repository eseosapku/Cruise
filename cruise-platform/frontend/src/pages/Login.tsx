import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoginForm from '../components/modules/Auth/LoginForm';
import RegisterForm from '../components/modules/Auth/RegisterForm';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';

const Login: React.FC = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const { loading, error, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleAuthSuccess = () => {
        setModalMessage('Authentication successful! Redirecting to dashboard...');
        setShowModal(true);

        setTimeout(() => {
            navigate('/dashboard');
        }, 1500);
    };

    const handleAuthError = (errorMessage: string) => {
        setModalMessage(errorMessage);
        setShowModal(true);
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
    };

    if (loading) {
        return <Loading message="Authenticating..." />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-white">
                        {isLoginMode ? 'Sign in to your account' : 'Create your account'}
                    </h2>
                    <p className="mt-2 text-sm text-blue-200">
                        {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={toggleMode}
                            className="ml-2 font-medium text-white hover:text-blue-200 underline"
                        >
                            {isLoginMode ? 'Register here' : 'Sign in here'}
                        </button>
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="glassmorphism p-8 rounded-xl">
                        {error && (
                            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-100 rounded-lg">
                                {error}
                            </div>
                        )}

                        {isLoginMode ? (
                            <LoginForm
                                onSuccess={handleAuthSuccess}
                                onError={handleAuthError}
                            />
                        ) : (
                            <RegisterForm
                                onSuccess={handleAuthSuccess}
                                onError={handleAuthError}
                            />
                        )}
                    </div>

                    <div className="text-center">
                        <Link
                            to="/"
                            className="text-blue-200 hover:text-white transition-colors"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>

            {showModal && (
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={modalMessage.includes('successful') ? 'Success' : 'Error'}
                >
                    <p className="text-gray-300">{modalMessage}</p>
                </Modal>
            )}
        </div>
    );
};

export default Login;