<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
    
    // Add user state
    let user = null;
    let loading = true;

    const navigationItems = [
        { 
            name: 'Home', 
            href: '/home', 
            icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                   </svg>`
        },
        { 
            name: 'Explore', 
            href: '/explore',
            icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>`
        },
        { 
            name: 'Messages', 
            href: '/messages',
            icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                   </svg>`
        },
        { 
            name: 'Notifications', 
            href: '/notifications',
            icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                   </svg>`
        },
        { 
            name: 'Bookmarks', 
            href: '/bookmarks',
            icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                   </svg>`
        },
        { 
            name: 'Create', 
            href: '/create',
            icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>`
        },
        { 
            name: 'Profile', 
            href: '/profile',
            icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                   </svg>`
        }
    ];

    let isOpen = false; // For mobile menu
    let isProfileMenuOpen = false;

    function isActive(href) {
        return $page.url.pathname === href;
    }

    function toggleMenu() {
        isOpen = !isOpen;
    }

    function toggleProfileMenu() {
        isProfileMenuOpen = !isProfileMenuOpen;
    }

    // Close menu when clicking outside
    function handleClickOutside(event) {
        const profileMenu = document.getElementById('profile-menu');
        if (profileMenu && !profileMenu.contains(event.target)) {
            isProfileMenuOpen = false;
        }
    }

    async function loadUser() {
        const token = localStorage.getItem('token');
        if (!token) {
            goto('/login');
            return;
        }

        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                user = await response.json();
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                goto('/login');
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            loading = false;
        }
    }

    function handleLogout() {
        localStorage.removeItem('token');
        goto('/login');
    }

    onMount(() => {
        loadUser();
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });
</script>

<div class="min-h-screen bg-[#FDF8F4]">
    <!-- Mobile menu button -->
    <div class="lg:hidden fixed top-4 left-4 z-50">
        <button 
            on:click={toggleMenu}
            class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
            </svg>
        </button>
    </div>

    <!-- Sidebar -->
    <nav class={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-white shadow-lg`}>
        <div class="h-full flex flex-col justify-between p-4">
            <!-- Logo -->
            <div class="px-4 py-5">
                <h1 class="text-2xl font-bold text-primary">LinkMeUp</h1>
            </div>

            <!-- Navigation Items -->
            <div class="flex-1 space-y-1">
                {#each navigationItems as item}
                    <a
                        href={item.href}
                        class="flex items-center px-4 py-3 text-gray-700 rounded-xl transition-colors {isActive(item.href) ? 'bg-primary text-white' : 'hover:bg-gray-100'}"
                        aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                        {@html item.icon}
                        <span class="ml-3">{item.name}</span>
                    </a>
                {/each}
            </div>

            <!-- User Profile Section -->
            <div class="border-t pt-4">
                {#if loading}
                    <div class="px-4 py-3">
                        <div class="animate-pulse flex items-center">
                            <div class="rounded-full bg-gray-200 h-10 w-10"></div>
                            <div class="ml-3 space-y-2">
                                <div class="h-4 bg-gray-200 rounded w-24"></div>
                                <div class="h-3 bg-gray-200 rounded w-16"></div>
                            </div>
                        </div>
                    </div>
                {:else if user}
                    <div class="relative" id="profile-menu">
                        <button 
                            on:click={toggleProfileMenu}
                            class="w-full flex items-center px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                            aria-label="User menu"
                            aria-expanded={isProfileMenuOpen}
                        >
                            <div class="flex-shrink-0">
                                {#if user.avatar}
                                    <img
                                        src={user.avatar}
                                        alt="Profile"
                                        class="h-10 w-10 rounded-full object-cover"
                                    />
                                {:else}
                                    <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span class="text-gray-500 text-lg">
                                            {user.username?.[0]?.toUpperCase() || '?'}
                                        </span>
                                    </div>
                                {/if}
                            </div>
                            <div class="ml-3 flex-1">
                                <p class="text-sm font-medium text-gray-700">{user.username}</p>
                                <p class="text-xs text-gray-500">@{user.username.toLowerCase()}</p>
                            </div>
                            <svg 
                                class="w-5 h-5 text-gray-400 transform transition-transform duration-200 {isProfileMenuOpen ? 'rotate-180' : ''}" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <!-- Dropdown Menu -->
                        {#if isProfileMenuOpen}
                            <div 
                                class="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-lg py-1 mx-4"
                                transition:slide={{ duration: 200 }}
                            >
                                <a 
                                    href="/profile/settings" 
                                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Settings
                                </a>
                                <button 
                                    on:click={handleLogout}
                                    class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                >
                                    Sign out
                                </button>
                            </div>
                        {/if}
                    </div>
                {:else}
                    <div class="px-4 py-3">
                        <a 
                            href="/login"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary"
                        >
                            Sign in
                        </a>
                    </div>
                {/if}
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="lg:ml-64 min-h-screen">
        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <slot />
        </div>
    </main>
</div>

<style>
    /* Add any custom styles here */
</style> 