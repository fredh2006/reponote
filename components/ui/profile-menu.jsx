'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, User, ChevronDown, Github } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'


export function ProfileMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)
    const { user, signOut } = useAuth()

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) return null

  const { user_metadata } = user
  const avatarUrl = user_metadata.avatar_url
  const displayName = user_metadata.full_name || user_metadata.user_name || 'User'
  const githubUsername = user_metadata.user_name

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity bg-gray-50 px-3 py-1.5 rounded-full cursor-pointer"
      >
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-8 h-8 rounded-full ring-2 ring-gray-200"
        />
        <span className="text-sm font-medium text-gray-700">{displayName}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-3 px-2 py-1.5">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">@{githubUsername}</p>
              </div>
            </div>
          </div>
          <div className="py-1" role="menu" aria-orientation="vertical">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4 mr-2 text-gray-500" />
              View Profile
            </Link>
            <a
              href={`https://github.com/${githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <Github className="w-4 h-4 mr-2 text-gray-500" />
              GitHub Profile
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              role="menuitem"
            >
              <LogOut className="w-4 h-4 mr-2 text-gray-500" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}