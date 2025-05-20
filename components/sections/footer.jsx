import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Left Column - About */}
          <div className="space-y-6">
            <h3 className="text-white text-2xl font-semibold">RepoNote</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Your personal repository for notes, ideas, and knowledge management. 
              Organize your thoughts and boost your productivity.
            </p>
          </div>

          {/* Right Column - Links */}
          <div className="flex flex-col justify-between">
            <div className="flex space-x-8 text-base text-gray-400">
              <Link 
                href="/privacy" 
                className="hover:text-white transition-colors duration-200 font-medium"
              >
                Privacy Policy
              </Link>
              <a
                href="https://github.com/fredh2006/reponote"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200 font-medium"
              >
                GitHub
              </a>
            </div>
            <p className="text-base text-gray-400 mt-8">
              &copy; {new Date().getFullYear()} RepoNote. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
