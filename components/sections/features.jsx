import { Sparkles, Code, FileText } from "lucide-react"

export default function Features(){
    return(
    <section id="features" className="w-full py-16 md:py-28 lg:py-36 bg-gray-50 dark:bg-gray-900">
    <div className="w-full px-6 md:px-8 lg:px-12">
      <div className="flex flex-col items-center justify-center space-y-8 text-center">
        <div className="space-y-4">
          <div className="inline-block rounded-lg bg-gray-100 px-4 py-2 text-lg font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100">Features</div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900 dark:text-white">
            Everything You Need for Perfect Documentation
          </h2>
          <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-300 relative z-10">
            Reponote provides all the tools you need to create comprehensive, professional README files for your
            projects.
          </p>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-16 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col items-center space-y-4 rounded-xl border bg-white p-8 shadow-lg transition-transform hover:scale-105 dark:bg-gray-800">
          <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <Sparkles className="h-6 w-6 text-gray-900 dark:text-gray-100" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI-Powered</h3>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Advanced AI analyzes your project to generate relevant, accurate documentation.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-4 rounded-xl border bg-white p-8 shadow-lg transition-transform hover:scale-105 dark:bg-gray-800">
          <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <Code className="h-6 w-6 text-gray-900 dark:text-gray-100" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Code Integration</h3>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Seamlessly integrates with GitHub repositories (GitLab and BitBucket coming soon!).
          </p>
        </div>
        <div className="flex flex-col items-center space-y-4 rounded-xl border bg-white p-8 shadow-lg transition-transform hover:scale-105 dark:bg-gray-800">
          <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <FileText className="h-6 w-6 text-gray-900 dark:text-gray-100" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Customizable Templates</h3>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Choose from various templates or create your own to match your project's style.
          </p>
        </div>
      </div>
    </div>
  </section>
    )
}