'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from '@/components/sections/navbar';
import { Button } from "@/components/ui/button";
import { Loader2, Star, GitFork, ChevronDown, ChevronRight } from "lucide-react";

export default function CreateRepo() {
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

    const key = process.env.NEXT_PUBLIC_DEEPSEEK_KEY;

    const getProviderToken = async () => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) throw userError;

            setUser(user);

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
            if (["JavaScript", "TypeScript", "Vue"].includes(topLanguage)) {
                const pkgPath = await findFileRecursive('package.json');
                const pkgRaw = pkgPath ? await fetchFileContent(pkgPath) : null;
                if (!pkgRaw) return null;

                const pkg = JSON.parse(pkgRaw);
                const deps = { ...pkg.dependencies, ...pkg.devDependencies };

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

    const summarizeFilesWithAI = async (files) => {
        try {
            const summarizedFiles = await Promise.all(
                files.map(async (file) => {
                    if (file.content.length <= 1500) return file;

                    const prompt = `
              Create a concise technical summary (max 300 characters) of this file for README documentation.
              Focus ONLY on:
              - Core functionality
              - Key configurations
              - Critical exports/imports
              
              File: ${file.path}
              Content: ${file.content}
              
              Rules:
              - Omit implementation details
              - Never reference other files
              - Use present tense ("Handles X" not "This file handles X")
              - If the file doesn't contain code, just say "This file doesn't contain code"
              - Return ONLY the summary text
              `;

                    const response = await fetch('/api/summarize', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ prompt })
                    });

                    if (!response.ok) throw new Error('Summarization failed');

                    const data = await response.json();
                    return {
                        path: file.path,
                        content: data.content
                    };
                })
            );

            return summarizedFiles;
        } catch (error) {
            console.error("File summarization error:", error);
            return files;
        }
    };

    const generateReadmeFromAI = async () => {
        if (selectedFiles.length === 0) return;

        if (user?.id) {
            const { data: userData, error } = await supabase
                .from('users')
                .select('plan, uses')
                .eq('id', user.id)
                .single();
            if (!error && userData?.plan === 'free' && (userData?.uses || 0) >= 1) {
                alert('You have reached your free usage limit. Upgrade to Pro for unlimited README generations.');
                return;
            }
        }

        setGenerating(true);
        const summarizedFiles = await summarizeFilesWithAI(
            await Promise.all(
                selectedFiles.map(async (file) => ({
                    path: file.path,
                    content: await fetchFileContent(file.path)
                }))
            )
        );

        const { data: userData } = await supabase
            .from('users')
            .select('plan')
            .eq('id', user.id)
            .single();
        const model = userData?.plan === 'pro' || userData?.plan === 'lifetime'
            ? 'gpt-4.1'
            : 'deepseek/deepseek-r1-zero:free';

        const languagesList = Object.keys(repoLanguages).join(', ') || 'Unknown';
        const frameworkInfo = frameworks ? `Framework: ${frameworks}` : 'No framework detected';
        const license = repoData.license ? repoData.license.name : 'No license specified';
        const collaborators = await fetchCollaborators()
        const collaboratorInfo = collaborators.length > 0
            ? collaborators.map(c => `- [${c.login}](${c.html_url})`).join('\n')
            : null;

        try {
            const prompt = `
            Generate a professional README.md in first-person perspective using EXACTLY this structure and rules:
            
            # Required Sections (IN THIS ORDER)
            
            ## 1. Project Overview
            - 3 concise sentences following this template:
              1. Core functionality of this repository. Write 2 sentences.
              2. Ideal user ("Perfect for [target users] who need...")
            - Write in first person perspective, and put all 3 sentences in one paragraph. 
            
            ## 2. Tech Stack
            - Format: "Built with [Technology1], [Technology2], [Technology3]"
            - Include ONLY:
              - Primary frameworks (React, Django, etc.)
              - Core languages (only if no framework exists)
              - Essential services (AWS, Firebase, etc.)
            - Exclude:
              - Development tools (Webpack, Babel)
              - Linters/formatters
              - Version numbers
            - ENSURE you don't mention anything else about the technolgy, just their name.
            
            ## 3. Installation & Setup
            ### Required Sub-sections:
            **Prerequisites**  
            - Bulleted list of required software  
            - Include versions ONLY if specified in files
            - ENSURE you don't mention "version specified in files" or anything like that, just list the software.
            
            **Quick Start**     
            1. Numbered steps using bash commands  
            2. Code blocks WITHOUT backticks:  
               $ npm install  
               $ npm start  
            3. Include ONE environment setup example if relevant
            
            ## 4. Project Structure
            ${summarizedFiles.length >= 3 ? `
            - Format per line: \`/path/to/file\`: Brief purpose (≤12 words)
            - Include only files with visible content
            - Never infer unverified relationships
            - Don't include files you only see from imports, only describe files that have been directly given to you.
            - Ensure that each path is on a new line.
            - Example:  
              \`/src/index.js\`: Main application entry point  
              \`/config/db.js\`: Database connection configuration  
            ` : 'SKIP THIS SECTION'}
            
            ## 5. License
            - Use exact phrasing:  
              ${license !== 'No license specified'
                ? `License: ${license}`
                : 'License: Not currently specified'}
            
            ${collaboratorInfo ? `
            ## 6. Contributors  
            ${collaboratorInfo}` : ''}
            
            # Critical Rules
            1. ABSOLUTELY NO markdown code blocks (e.g. \`\`\`)
            2. Max 80 characters per line
            3. Never reference files not explicitly shown
            4. Use ONLY these section headers verbatim
            5. Omit sections without confident information
            6. Never use: "appears", "seems", "likely", "probably"
            
            # Context (DO NOT MENTION IN README)
            || Languages: ${languagesList}  
            || Framework: ${frameworkInfo}  
            || File Analysis:  
            ${summarizedFiles.map(f => `|| ${f.path}: ${f.content}`).join('\n')}
            `;

            if (model === 'deepseek/deepseek-r1-zero:free') {
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
                                    "temperature": 0.3,
                                    "content": prompt
                                }
                            ]
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch from AI');
                    }

                    const data = await response.json();
                    let aiReadme = data.choices[0].message.content;

                    aiReadme = aiReadme.replace(/\\boxed\s*{```(?:markdown|text)?\n([\s\S]*?)\n```}/g, '$1');
                    aiReadme = aiReadme.replace(/\\boxed\s*{([\s\S]*?)}/g, '$1');
                    aiReadme = aiReadme.replace(/```(?:markdown|text)?\n?([\s\S]*?)\n?```/g, '$1');

                    setReadme(aiReadme.trim());

                    if (user?.id) {
                        const { data: userData, error } = await supabase
                            .from('users')
                            .select('uses')
                            .eq('id', user.id)
                            .single();
                        if (!error) {
                            const newUses = (userData?.uses || 0) + 1;
                            await supabase
                                .from('users')
                                .update({ uses: newUses })
                                .eq('id', user.id);
                        }
                    }
                } catch (error) {
                    const fallbackPrompt = prompt;
                    const response = await fetch('/api/openai', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            prompt: fallbackPrompt,
                            model: 'gpt-4.1'
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to generate README with fallback model');
                    }

                    const data = await response.json();
                    let aiReadme = data.content;

                    aiReadme = aiReadme.replace(/\\boxed\s*{```(?:markdown|text)?\n([\s\S]*?)\n```}/g, '$1');
                    aiReadme = aiReadme.replace(/\\boxed\s*{([\s\S]*?)}/g, '$1');
                    aiReadme = aiReadme.replace(/```(?:markdown|text)?\n?([\s\S]*?)\n?```/g, '$1');

                    setReadme(aiReadme.trim());

                    if (user?.id) {
                        const { data: userData, error } = await supabase
                            .from('users')
                            .select('uses')
                            .eq('id', user.id)
                            .single();
                        if (!error) {
                            const newUses = (userData?.uses || 0) + 1;
                            await supabase
                                .from('users')
                                .update({ uses: newUses })
                                .eq('id', user.id);
                        }
                    }
                }
            } else {
                const prompt = `
You are generating a professional README.md in first-person voice. Follow the exact structure below. Only include sections with confidently available data.

---

## 1. Project Overview
Write one paragraph with 3 sentences:
1. What this project does and why you built it.
2. A second sentence expanding its core functionality.
3. Who it's for. Start with "Perfect for..."

## 2. Tech Stack
- Use this exact format: "Built with X, Y, Z"
- Only include frameworks, core languages (if no framework), and key services (e.g. Firebase)
- Do NOT include tools, linters, or version numbers
- ENSURE you don't mention anything else about the technolgy, just their name.

## 3. Installation & Setup

**Prerequisites**
- List required software (include versions if shown in files)
- Do not reference how versions were detected
- ENSURE you don't mention "version specified in files" or anything like that, just list the software.


**Quick Start**
- Show numbered install/run steps using bash syntax
- Code must be shown like this:
  $ npm install
  $ npm start
- Include environment variable setup if relevant
- Include information about cloning the repository if relevant

${summarizedFiles.length >= 3 ? `

## 4. Project Structure
List important files like this:
\`/src/index.js\`: Main application entry point  
\`/config/db.js\`: Database connection configuration  

- Use around 20 words per file
- Only include files with direct content provided
- Never infer from imports
- Format per line: **include literal backticks** like this: \`/path/to/file\`: Brief description
- Each file path **must** be surrounded by backticks — this is mandatory
- You MUST surround each file path with backticks like \`this\`
` : ''}

## 5. License
${license !== 'No license specified' ? 'License: ' + license : 'No license in use.'}

${collaboratorInfo ? `

## 6. Contributors
${collaboratorInfo}` : ''}

---

### Rules (Very Important)
- Never use backticks or markdown code blocks
- Use ONLY these section headers
- Do NOT reference files unless content was provided
- Never say "appears," "likely," "seems," or similar
- Be confident, clean, and descriptive in your writing

---

### Internal Context (DO NOT INCLUDE)
Languages: ${languagesList}
Framework: ${frameworkInfo}
${summarizedFiles.map(f => `File: ${f.path}\n${f.content}`).join('\n')}
`
                const response = await fetch('/api/openai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prompt,
                        model
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to generate README');
                }

                const data = await response.json();
                let aiReadme = data.content;

                aiReadme = aiReadme.replace(/\\boxed\s*{```(?:markdown|text)?\n([\s\S]*?)\n```}/g, '$1');
                aiReadme = aiReadme.replace(/\\boxed\s*{([\s\S]*?)}/g, '$1');
                aiReadme = aiReadme.replace(/```(?:markdown|text)?\n?([\s\S]*?)\n?```/g, '$1');

                setReadme(aiReadme.trim());

                if (user?.id) {
                    const { data: userData, error } = await supabase
                        .from('users')
                        .select('uses')
                        .eq('id', user.id)
                        .single();
                    if (!error) {
                        const newUses = (userData?.uses || 0) + 1;
                        await supabase
                            .from('users')
                            .update({ uses: newUses })
                            .eq('id', user.id);
                    }
                }
            }
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