export default function Steps(){
    return(
        <section id="how-it-works" className="w-full py-16 md:py-28 lg:py-36 bg-white dark:bg-gray-800">
        <div className="w-full px-6 md:px-8 lg:px-12">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-gray-100 px-4 py-2 text-lg font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                How It Works
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Three Simple Steps</h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-300">
                Creating the perfect README has never been easier.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 py-16 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Connect Your Repository</h3>
              <p className="text-center text-gray-600 dark:text-gray-300">
                Link your GitHub repository to Reponote.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Customize Options</h3>
              <p className="text-center text-gray-600 dark:text-gray-300">
                Choose the sections you want to include in your README.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Generate & Download</h3>
              <p className="text-center text-gray-600 dark:text-gray-300">
                AI generates your README, which you can edit, or commit directly.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
}