'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Menu } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface HeaderProps {
    projectName: string;
    userName: string;
}

const Header: React.FC<HeaderProps> = ({ projectName, userName }) => {
    const router = useRouter();
    const [showMenu, setShowMenu] = React.useState(false);

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/auth/login');
    };

    return (
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center">
                <Link href="/dashboard" className="text-xl font-semibold text-gray-800">
                    Dashboard
                </Link>
                {projectName && (
                    <>
                        <span className="mx-2 text-gray-400">/</span>
                        <span className="text-gray-600">{projectName}</span>
                    </>
                )}
            </div>

            <div className="relative">
                <button
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setShowMenu(!showMenu)}
                >
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline">{userName}</span>
                    <Menu className="h-4 w-4" />
                </button>

                {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                        <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowMenu(false)}
                        >
                            Profil
                        </Link>
                        <Link
                            href="/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowMenu(false)}
                        >
                            Projekte
                        </Link>
                        <hr className="my-1 border-gray-200" />
                        <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Abmelden
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;