'use client';

import Navbar from '@/components/sections/navbar';
import { Button } from "@/components/ui/button";
import { ChevronRight, FileText, Github, Settings, Sparkles } from "lucide-react";
import Link from 'next/link';

export default function Documentation() {
    return (
        <>
            <Navbar sticky={false} />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-8">

                        <section className="space-y-4">
                            <h1 className="text-4xl font-bold text-gray-900">Documentation</h1>
                            <p className="text-lg text-gray-600">
                                Reponote helps you create professional README files for your GitHub repositories using AI. 
                                This guide will walk you through all the features and how to use them effectively.
                            </p>
                        </section>


                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                                <Sparkles className="w-6 h-6" />
                                Getting Started
                            </h2>
                            <div className="space-y-4 text-gray-600">
                                <p>To get started with Reponote:</p>
                                <ol className="list-decimal list-inside space-y-2 ml-4">
                                    <li>Sign in with your GitHub account</li>
                                    <li>Select a repository from your list</li>
                                    <li>Choose which files to include in the README generation</li>
                                    <li>Generate and customize your README</li>
                                </ol>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                                <Settings className="w-6 h-6" />
                                Features
                            </h2>
                            <div className="grid gap-6">

                                <div className="bg-white p-6 rounded-lg border shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">File Selection</h3>
                                    <p className="text-gray-600 mb-4">
                                        Reponote allows you to select specific files from your repository to include in the README generation process.
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                        <li>Browse your repository's file structure</li>
                                        <li>Select individual files or entire directories</li>
                                        <li>Files under 1500 characters are automatically included without summarization</li>
                                        <li>Larger files are summarized to capture their key functionality</li>
                                    </ul>
                                </div>

                                <div className="bg-white p-6 rounded-lg border shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Generation</h3>
                                    <p className="text-gray-600 mb-4">
                                        Reponote uses advanced AI models to generate professional README files.
                                    </p>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Free Tier</h4>
                                            <p className="text-gray-600">
                                                Uses DeepSeek's model to generate READMEs with basic features.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Pro/Lifetime Tier</h4>
                                            <p className="text-gray-600">
                                                Access to GPT-4.1 for more sophisticated README generation with:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4 mt-2">
                                                <li>Better context understanding</li>
                                                <li>More accurate technical descriptions</li>
                                                <li>Improved formatting and structure</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg border shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">README Structure</h3>
                                    <p className="text-gray-600 mb-4">
                                        Generated READMEs follow a professional structure with these sections:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                                        <li>
                                            <span className="font-medium">Project Overview</span>
                                        </li>
                                        <li>
                                            <span className="font-medium">Tech Stack</span>
                                        </li>
                                        <li>
                                            <span className="font-medium">Installation & Setup</span>
                                        </li>
                                        <li>
                                            <span className="font-medium">Project Structure</span>
                                        </li>
                                        <li>
                                            <span className="font-medium">License</span>
                                        </li>
                                        <li>
                                            <span className="font-medium">Contributors</span>
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="w-6 h-6" />
                                Best Practices
                            </h2>
                            <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">File Selection</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                        <li>Include key configuration files (e.g., package.json, requirements.txt)</li>
                                        <li>Select main application files that show core functionality, e.g. files that describe the purpose of the project</li>
                                        <li>Include setup/installation scripts if available</li>
                                        <li>Avoid selecting test files or temporary files</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">README Customization</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                        <li>Review and edit the generated README before saving</li>
                                        <li>Ensure all links and paths are correct</li>
                                        <li>Add any project-specific information not detected by the AI</li>
                                        <li>Verify that the tech stack is accurately represented</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                                <Github className="w-6 h-6" />
                                Troubleshooting
                            </h2>
                            <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Common Issues</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                        <li>
                                            <span className="font-medium">GitHub Authentication Issues</span>
                                            <p className="ml-6 mt-1">Try logging out and logging back in to refresh your GitHub token.</p>
                                        </li>
                                        <li>
                                            <span className="font-medium">File Access Errors</span>
                                            <p className="ml-6 mt-1">Ensure your GitHub token has the necessary repository access permissions.</p>
                                        </li>
                                        <li>
                                            <span className="font-medium">AI Generation Failures</span>
                                            <p className="ml-6 mt-1">Try reducing the number of selected files or selecting different files.</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
} 