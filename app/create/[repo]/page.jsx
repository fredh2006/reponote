'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from '@/components/sections/navbar';
import { Button } from "@/components/ui/button";
import { Loader2, Star, GitFork, ChevronDown, ChevronRight } from "lucide-react";

export default function CreateRepo({ params }) {
    const router = useRouter();
    const supabase = createClient();
    const { repo } = useParams();
    const decodedRepo = decodeURIComponent(repo);

    const [repoData, setRepoData] = useState(null);
    const [repoLanguages, setRepoLanguages] = useState({});
    const [frameworks, setFrameworks] = useState(null);
    const [loading, setLoading] = useState(true);
    const [readme, setReadme] = useState('');
    const [saving, setSaving] = useState(false);
    const [fileTree, setFileTree] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [token, setToken] = useState('');
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    const key = process.env.NEXT_PUBLIC_API_KEY;

    const getProviderToken = async () => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) throw userError;

            setUser(user);

            // Get user data from the users table
            const { data: userData, error: userDataError } = await supabase
                .from('users')
                .select('provider_token')
                .eq('id', user.id)
                .single();

            if (userDataError) throw userDataError;

            if (!userData?.provider_token) {
                throw new Error('GitHub access token not found. Please log out and log in again to grant repository access.');
            }

            setToken(userData.provider_token);

            // Fetch repository data
            const response = await fetch(`https://api.github.com/repos/${decodedRepo}`, {
                headers: {
                    'Authorization': `Bearer ${userData.provider_token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch repository data');
            }

            const repoData = await response.json();
            setRepoData(repoData);

            // Fetch languages
            const langResponse = await fetch(`https://api.github.com/repos/${decodedRepo}/languages`, {
                headers: {
                    'Authorization': `Bearer ${userData.provider_token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (langResponse.ok) {
                const languages = await langResponse.json();
                setRepoLanguages(languages);
                const topLanguage = Object.entries(languages)[0]?.[0];
                if (topLanguage) {
                    const fw = await detectFrameworkFromRepo(decodedRepo, userData.provider_token, topLanguage);
                    setFrameworks(fw);
                }
            }

            // Fetch README
            const readmeResponse = await fetch(`https://api.github.com/repos/${decodedRepo}/contents/README.md`, {
                headers: {
                    'Authorization': `Bearer ${userData.provider_token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (readmeResponse.ok) {
                const readmeData = await readmeResponse.json();
                const content = atob(readmeData.content);
                setReadme(content);
            }

            // Fetch file tree
            const treeResponse = await fetch(`https://api.github.com/repos/${decodedRepo}/git/trees/main?recursive=1`, {
                headers: {
                    'Authorization': `Bearer ${userData.provider_token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (treeResponse.ok) {
                const data = await treeResponse.json();
                const files = data.tree.filter(item => item.type === 'blob');
                setFileTree(files);
            }

        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProviderToken();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                router.push('/');
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [supabase, decodedRepo, router]);

    const fetchFileContent = async (path) => {
        const res = await fetch(`https://api.github.com/repos/${decodedRepo}/contents/${path}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return atob(data.content);
    };

    const toggleFileSelection = async (filePath) => {
        if (selectedFiles.some(file => file.path === filePath)) {
            setSelectedFiles(selectedFiles.filter(file => file.path !== filePath));
        } else {
            const content = await fetchFileContent(filePath);
            if (content !== null) {
                setSelectedFiles([...selectedFiles, { path: filePath, content }]);
            }
        }
    };

    const detectFrameworkFromRepo = async (repoFullName, token, topLanguage) => {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        };

        const findFileRecursive = async (filename, path = '') => {
            const res = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${path}`, { headers });
            if (!res.ok) return null;
            const items = await res.json();
            for (const item of items) {
                if (item.type === 'file' && item.name === filename) return item.path;
                else if (item.type === 'dir') {
                    const found = await findFileRecursive(filename, item.path);
                    if (found) return found;
                }
            }
            return null;
        };

        const fetchFileContent = async (path) => {
            const res = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${path}`, { headers });
            if (!res.ok) return null;
            const data = await res.json();
            return atob(data.content);
        };

        try {
            // JavaScript/TypeScript frameworks
            if (["JavaScript", "TypeScript", "Vue"].includes(topLanguage)) {
                const pkgPath = await findFileRecursive('package.json');
                const pkgRaw = pkgPath ? await fetchFileContent(pkgPath) : null;
                if (!pkgRaw) return null;

                const pkg = JSON.parse(pkgRaw);
                const deps = { ...pkg.dependencies, ...pkg.devDependencies };

                // Check for framework-specific dependencies
                if (deps?.['next'] || deps?.['@next/core']) return 'Next.js';
                if (deps?.['react'] || deps?.['react-dom']) return 'React';
                if (deps?.['express']) return 'Express';
                if (deps?.['vue'] || deps?.['@vue/core']) return 'Vue';
                if (deps?.['svelte'] || deps?.['@sveltejs/kit']) return 'Svelte';
                if (deps?.['@angular/core']) return 'Angular';
                if (deps?.['nuxt'] || deps?.['@nuxt/core']) return 'Nuxt.js';
                if (deps?.['gatsby']) return 'Gatsby';
                if (deps?.['@nestjs/core']) return 'NestJS';
                if (deps?.['@remix-run/core']) return 'Remix';
                return 'None';
            } 
            // Python frameworks
            else if (topLanguage === 'Python') {
                const reqPath = await findFileRecursive('requirements.txt');
                const pyprojPath = await findFileRecursive('pyproject.toml');
                const setupPath = await findFileRecursive('setup.py');

                let content = '';
                if (reqPath) {
                    content = await fetchFileContent(reqPath);
                } else if (pyprojPath) {
                    content = await fetchFileContent(pyprojPath);
                } else if (setupPath) {
                    content = await fetchFileContent(setupPath);
                }

                if (content) {
                    // Check for framework-specific patterns
                    if (content.match(/flask[>=<]/i) || content.includes('from flask import')) return 'Flask';
                    if (content.match(/django[>=<]/i) || content.includes('from django')) return 'Django';
                    if (content.match(/fastapi[>=<]/i) || content.includes('from fastapi')) return 'FastAPI';
                    if (content.match(/pyramid[>=<]/i) || content.includes('from pyramid')) return 'Pyramid';
                    if (content.match(/bottle[>=<]/i) || content.includes('from bottle')) return 'Bottle';
                    if (content.match(/tornado[>=<]/i) || content.includes('from tornado')) return 'Tornado';
                    if (content.match(/sanic[>=<]/i) || content.includes('from sanic')) return 'Sanic';
                    if (content.match(/aiohttp[>=<]/i) || content.includes('from aiohttp')) return 'aiohttp';
                    return 'None';
                }
            }
            // Ruby frameworks
            else if (topLanguage === 'Ruby') {
                const gemfilePath = await findFileRecursive('Gemfile');
                if (gemfilePath) {
                    const content = await fetchFileContent(gemfilePath);
                    if (content.match(/gem ['"]rails['"]/) || content.match(/gem ['"]railties['"]/)) return 'Ruby on Rails';
                    if (content.match(/gem ['"]sinatra['"]/)) return 'Sinatra';
                    if (content.match(/gem ['"]hanami['"]/)) return 'Hanami';
                    return 'None';
                }
            }
            // PHP frameworks
            else if (topLanguage === 'PHP') {
                const composerPath = await findFileRecursive('composer.json');
                if (composerPath) {
                    const content = await fetchFileContent(composerPath);
                    if (content.match(/"laravel\/framework"/) || content.match(/"laravel\/laravel"/)) return 'Laravel';
                    if (content.match(/"symfony\/symfony"/) || content.match(/"symfony\/framework-bundle"/)) return 'Symfony';
                    if (content.match(/"slim\/slim"/)) return 'Slim';
                    if (content.match(/"codeigniter\/framework"/)) return 'CodeIgniter';
                    return 'None';
                }
            }
            // Java frameworks
            else if (topLanguage === 'Java') {
                const pomPath = await findFileRecursive('pom.xml');
                const gradlePath = await findFileRecursive('build.gradle');
                
                let content = '';
                if (pomPath) {
                    content = await fetchFileContent(pomPath);
                } else if (gradlePath) {
                    content = await fetchFileContent(gradlePath);
                }

                if (content) {
                    if (content.match(/spring-boot-starter/) || content.match(/spring-boot/)) return 'Spring Boot';
                    if (content.match(/quarkus/) || content.match(/io.quarkus/)) return 'Quarkus';
                    if (content.match(/micronaut/) || content.match(/io.micronaut/)) return 'Micronaut';
                    if (content.match(/play-framework/) || content.match(/com.typesafe.play/)) return 'Play Framework';
                    return 'None';
                }
            }
            // Go frameworks
            else if (topLanguage === 'Go') {
                const goModPath = await findFileRecursive('go.mod');
                if (goModPath) {
                    const content = await fetchFileContent(goModPath);
                    if (content.match(/github\.com\/gin-gonic\/gin/)) return 'Gin';
                    if (content.match(/github\.com\/labstack\/echo/)) return 'Echo';
                    if (content.match(/github\.com\/gofiber\/fiber/)) return 'Fiber';
                    if (content.match(/github\.com\/beego\/beego/)) return 'Beego';
                    return 'None';
                }
            }
            // Rust frameworks
            else if (topLanguage === 'Rust') {
                const cargoPath = await findFileRecursive('Cargo.toml');
                if (cargoPath) {
                    const content = await fetchFileContent(cargoPath);
                    if (content.match(/actix-web/) || content.match(/actix_web/)) return 'Actix Web';
                    if (content.match(/rocket/) || content.match(/rocket =/)) return 'Rocket';
                    if (content.match(/axum/) || content.match(/axum =/)) return 'Axum';
                    if (content.match(/warp/) || content.match(/warp =/)) return 'Warp';
                    return 'None';
                }
            }
        } catch (err) {
            console.error('Framework detection error:', err);
        }

        return null;
    };

    const handleSave = async () => {
        if (!readme.trim() || !token) return;

        setSaving(true);
        try {
            const checkResponse = await fetch(`https://api.github.com/repos/${decodedRepo}/contents/README.md`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            let sha = null;
            if (checkResponse.ok) {
                const data = await checkResponse.json();
                sha = data.sha;
            }

            const response = await fetch(`https://api.github.com/repos/${decodedRepo}/contents/README.md`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: 'Update README.md - From Reponote',
                    content: btoa(readme),
                    ...(sha && { sha })
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('GitHub API Error:', errorData);
                throw new Error(`Failed to save README: ${errorData.message || 'Unknown error'}`);
            }

            router.push(`/create/${repo}/success`);
        } catch (error) {
            console.error('Failed to save README:', error);
            alert(`Failed to save README: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const groupFilesByDirectory = (files) => {
        return files.reduce((acc, file) => {
            const dir = file.path.split('/').slice(0, -1).join('/');
            if (!acc[dir]) {
                acc[dir] = [];
            }
            acc[dir].push(file);
            return acc;
        }, {});
    };

    const fetchCollaborators = async () => {
        try {
            const res = await fetch(`https://api.github.com/repos/${decodedRepo}/collaborators`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) return []
            const collaborators = await res.json()
            return collaborators.filter(c => !c.permissions?.admin) // exclude repo owner
        } catch (err) {
            console.error('Error fetching collaborators:', err)
            return []
        }
    }

    const generateReadmeFromAI = async () => {
        if (selectedFiles.length === 0) return;

        setGenerating(true);
        const fileContents = await Promise.all(
            selectedFiles.map(async (file) => ({
                path: file.path,
                content: await fetchFileContent(file.path)
            }))
        );

        const languagesList = Object.keys(repoLanguages).join(', ') || 'Unknown';
        const frameworkInfo = frameworks ? `Framework: ${frameworks}` : 'No framework detected';
        const license = repoData.license ? repoData.license.name : 'No license specified';
        const collaborators = await fetchCollaborators()
        const collaboratorInfo = collaborators.length > 0
            ? collaborators.map(c => `- [${c.login}](${c.html_url})`).join('\n')
            : null;

        const prompt = `
Your task is to create a clean, markdown-formatted README using the context and code snippets provided. The README should include the following sections - Make sure to include the titles of the section as well:
1. **Project Overview**: What the project does and its purpose. Keep this short, clean, and professional. Write 3 sentences.
2. **Tech Stack**: For this step, only include the name of the technology, nothing else. List only the major technologies used in the project (e.g., React, Node.js, Python, etc.) and third-party services (e.g. auth providers, databases, external APIS). Write them in a single sentence starting with "This project was created using" followed by a comma-separated list of technologies. Do not include version numbers, plugins, or development tools. If there are frameworks involved, don't inclcude the languages used.
3. **Installation & Setup**: How to install and run the project - use bash for this part.
4. **Project Structure**: Only include this section if you can confidently determine it **based solely on the files provided**. Only describe files whose content you actually see and ensure that the path to the file is correct. Do **not** mention any files or modules that are only referenced in comments, docstrings, or imports if their content isn't available. For each file, write **at most one sentence** summarizing its purpose, don't include any other information.
5. **License**: Mention the license or if none, say: No license is currently being used."
${collaboratorInfo ? `5. **Collaborators**\n${collaboratorInfo}` : ''}
        
**Instructions:**
- Write in the first person (e.g., Use the title of the project) - make it sound like you created the project.
- Be confident in the information you provide, don't say "appear", "seems", "likely", or any words like that.
- Avoid overly formal or robotic phrasing.
- Format using Markdown , but do **not** use triple backticks or boxed formatting.
- Return only the raw README content—no explanations, JSON, or extra messages.
- Do not include any other text other than the sections above.
        
## Context
        
**Languages**: ${languagesList}  
**Framework**: ${frameworkInfo}  
**License**: ${license}  
        
### Files Given:
${fileContents.map(f => `#### ${f.path}\n${f.content.slice(0, 1500)}`).join("\n\n")}
`;

        console.log(key);
        console.log(prompt);

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${key}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "deepseek/deepseek-r1-zero:free",
                    "messages": [
                        {
                            "role": "user",
                            "temperature": 0.1,
                            "content": prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch from AI');
            }

            const data = await response.json();
            console.log(data)
            let aiReadme = data.choices[0].message.content;

            aiReadme = aiReadme.replace(/\\boxed\s*{```(?:markdown|text)?\n([\s\S]*?)\n```}/g, '$1');
            aiReadme = aiReadme.replace(/\\boxed\s*{([\s\S]*?)}/g, '$1');
            aiReadme = aiReadme.replace(/```(?:markdown|text)?\n?([\s\S]*?)\n?```/g, '$1');

            setReadme(aiReadme.trim());
        } catch (error) {
            console.error('Error generating README from AI:', error);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/50">
                        <h2 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h2>
                        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
                        <button
                            onClick={() => {
                                supabase.auth.signOut();
                                router.push('/');
                            }}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                        >
                            Re-authenticate with GitHub
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <>
            <Navbar sticky={false} />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div className="space-y-4">
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create README</h1>
                                        <p className="text-gray-600 mt-1 text-sm sm:text-base">{repoData?.full_name || decodedRepo}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            {repoData?.language || 'Unknown'}
                                        </span>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="flex items-center gap-1">
                                            <Star className="w-4 h-4" />
                                            {repoData?.stargazers_count}
                                        </span>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="flex items-center gap-1">
                                            <GitFork className="w-4 h-4" />
                                            {repoData?.forks_count}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <Button
                                        size="lg"
                                        className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 sm:px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                        onClick={generateReadmeFromAI}
                                        disabled={generating}
                                    >
                                        {generating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            'Generate README'
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={handleSave}
                                        disabled={!readme.trim() || saving || generating}
                                        className="border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-medium px-4 sm:px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save README'
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="border rounded-lg">
                                        <textarea
                                            value={readme}
                                            onChange={(e) => setReadme(e.target.value)}
                                            placeholder="Write your README content here..."
                                            className="w-full h-[calc(100vh-20rem)] p-4 focus:outline-none resize-none"
                                        />
                                    </div>

                                    <div className="pt-6">
                                        <details className="group" open={false}>
                                            <summary className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-3 rounded-md">
                                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Select Files to Include</h2>
                                                <ChevronDown
                                                    className="w-5 h-5 transform group-open:rotate-180 transition-transform"
                                                    fill="none"
                                                    stroke="currentColor"
                                                />
                                            </summary>
                                            <div className="mt-4 border rounded-lg p-4 bg-gray-50 space-y-2 max-h-[60vh] overflow-y-auto">
                                                {Object.entries(groupFilesByDirectory(fileTree)).map(([directory, files]) => (
                                                    <details key={directory} className="group">
                                                        <summary className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                                                            <span className="font-medium text-gray-600 flex items-center">
                                                                <ChevronRight
                                                                    className="w-4 h-4 mr-2 transform group-open:rotate-90 transition-transform"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                />
                                                                <span className="truncate">{directory || 'Root Directory'}</span>
                                                            </span>
                                                            <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
                                                                {files.length} {files.length === 1 ? 'file' : 'files'}
                                                            </span>
                                                        </summary>
                                                        <div className="mt-2 pl-6 space-y-1">
                                                            {files.map((file) => (
                                                                <label
                                                                    key={file.path}
                                                                    className="flex items-center gap-2 text-sm text-gray-800 hover:bg-gray-100 p-2 rounded-md cursor-pointer group"
                                                                >
                                                                    <div className="relative flex items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            onChange={() => toggleFileSelection(file.path)}
                                                                            checked={selectedFiles.some(f => f.path === file.path)}
                                                                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 bg-white checked:border-gray-900 checked:bg-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                                                        />
                                                                        <svg
                                                                            className="pointer-events-none absolute left-0 top-0 h-4 w-4 opacity-0 peer-checked:opacity-100"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="white"
                                                                            strokeWidth="3"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        >
                                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                                        </svg>
                                                                    </div>
                                                                    <span className="truncate group-hover:text-gray-900">{file.path.split('/').pop()}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </details>
                                                ))}
                                            </div>
                                        </details>
                                    </div>
                                </div>

                                <div className="lg:col-span-1">
                                    <div className="sticky top-6">
                                        <div className="bg-gray-50 rounded-lg border p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Files</h3>
                                            {selectedFiles.length === 0 ? (
                                                <p className="text-gray-500 text-sm">No files selected</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {selectedFiles.map((file) => (
                                                        <div
                                                            key={file.path}
                                                            className="flex items-center justify-between p-2 bg-white rounded-md border"
                                                        >
                                                            <span className="text-sm text-gray-600 truncate flex-1">
                                                                {file.path}
                                                            </span>
                                                            <button
                                                                onClick={() => toggleFileSelection(file.path)}
                                                                className="ml-2 text-gray-400 hover:text-gray-600"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="16"
                                                                    height="16"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}