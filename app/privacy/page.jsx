import Navbar from "@/components/sections/navbar";

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Collection and Usage</h2>
              <p className="mb-4">
                At RepoNote, we take your privacy seriously. We want to be completely transparent about how we handle your data.
              </p>
              <p className="mb-4">
                <strong>Important:</strong> We do not store, edit, or modify any of your GitHub repositories or files. When you use RepoNote:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We only read the necessary information to generate README files</li>
                <li>We do not store any repository content</li>
                <li>We do not modify any files in your repositories</li>
                <li>We do not have write access to your repositories</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">GitHub Integration</h2>
              <p className="mb-4">
                When you connect your GitHub account to RepoNote, we only request the minimum permissions necessary to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Read repository information</li>
                <li>Generate README files</li>
                <li>View repository contents</li>
              </ul>
              <p className="mt-4">
                We never request or require write access to your repositories.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Storage</h2>
              <p className="mb-4">
                The only data we store is:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your GitHub authentication token (encrypted)</li>
                <li>Basic account information (username, email)</li>
              </ul>
              <p className="mt-4">
                We do not store any repository content, code, or files.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
} 