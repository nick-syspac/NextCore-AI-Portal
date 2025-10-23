import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          NextCore AI Cloud
        </h1>
        <p className="text-2xl text-gray-600 mb-12">
          Multi-tenant AI management platform for educational institutions
        </p>
        
        <div className="flex gap-4 justify-center mb-16">
          <Link
            href="/register"
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Multi-Tenant</h3>
            <p className="text-gray-600">
              Isolated environments for each institution with role-based access control
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">AI Gateway</h3>
            <p className="text-gray-600">
              Centralized routing to multiple AI models with usage tracking
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Self-Service</h3>
            <p className="text-gray-600">
              Email-based invitations and verification for secure onboarding
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
