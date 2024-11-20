<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let stats = {
        totalLinks: 0,
        totalClicks: 0,
        activeLinks: 0
    };
    
    let recentActivity = [];
    let loading = true;
    let error = null;

    onMount(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const data = await response.json();
            stats = data.stats;
            recentActivity = data.recentActivity;
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    });

    function handleLogout() {
        localStorage.removeItem('authToken');
        goto('/login');
    }
</script>

<div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm" aria-label="Main navigation">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex">
                    <div class="flex-shrink-0 flex items-center">
                        <h1 class="text-xl font-bold text-gray-900">LinkMeUp Dashboard</h1>
                    </div>
                </div>
                <div class="flex items-center">
                    <button
                        on:click={handleLogout}
                        class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        aria-label="Logout button"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {#if loading}
            <div class="flex justify-center items-center h-64" aria-label="Loading dashboard">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        {:else if error}
            <div class="bg-red-50 p-4 rounded-md" role="alert">
                <p class="text-red-700">{error}</p>
            </div>
        {:else}
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
                <div class="bg-white overflow-hidden shadow rounded-lg" aria-label="Total links statistics">
                    <div class="px-4 py-5 sm:p-6">
                        <dt class="text-sm font-medium text-gray-500 truncate">Total Links</dt>
                        <dd class="mt-1 text-3xl font-semibold text-gray-900">{stats.totalLinks}</dd>
                    </div>
                </div>
                
                <div class="bg-white overflow-hidden shadow rounded-lg" aria-label="Total clicks statistics">
                    <div class="px-4 py-5 sm:p-6">
                        <dt class="text-sm font-medium text-gray-500 truncate">Total Clicks</dt>
                        <dd class="mt-1 text-3xl font-semibold text-gray-900">{stats.totalClicks}</dd>
                    </div>
                </div>
                
                <div class="bg-white overflow-hidden shadow rounded-lg" aria-label="Active links statistics">
                    <div class="px-4 py-5 sm:p-6">
                        <dt class="text-sm font-medium text-gray-500 truncate">Active Links</dt>
                        <dd class="mt-1 text-3xl font-semibold text-gray-900">{stats.activeLinks}</dd>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white shadow rounded-lg" aria-label="Recent activity section">
                <div class="px-4 py-5 sm:p-6">
                    <h2 class="text-lg leading-6 font-medium text-gray-900">Recent Activity</h2>
                    <div class="mt-4">
                        {#if recentActivity.length === 0}
                            <p class="text-gray-500">No recent activity</p>
                        {:else}
                            <ul class="divide-y divide-gray-200" role="list">
                                {#each recentActivity as activity}
                                    <li class="py-4">
                                        <div class="flex space-x-3">
                                            <div class="flex-1 space-y-1">
                                                <p class="text-sm font-medium text-gray-900">{activity.type}</p>
                                                <p class="text-sm text-gray-500">{activity.description}</p>
                                            </div>
                                            <time class="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</time>
                                        </div>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </main>
</div> 