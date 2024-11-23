<script>
    import { token } from '$lib/stores/auth.js';
    import { debounce } from 'lodash-es';
    
    let searchQuery = '';
    let users = [];
    let loading = false;
    let error = null;

    const searchUsers = debounce(async (query) => {
        if (!query.trim()) {
            users = [];
            return;
        }

        loading = true;
        error = null;

        try {
            const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${$token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                users = data.users;
            } else {
                error = 'Failed to search users';
            }
        } catch (err) {
            error = 'Error searching users';
            console.error('Search error:', err);
        } finally {
            loading = false;
        }
    }, 300);

    $: if (searchQuery) {
        searchUsers(searchQuery);
    }
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Explore</h1>
    
    <!-- Search Input -->
    <div class="mb-6">
        <div class="relative">
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search users by username..."
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {#if loading}
                <div class="absolute right-3 top-1/2 -translate-y-1/2">
                    <div class="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                </div>
            {/if}
        </div>
    </div>

    <!-- Search Results -->
    {#if error}
        <div class="text-red-500 mb-4">{error}</div>
    {/if}

    {#if users.length > 0}
        <div class="grid gap-4">
            {#each users as user}
                <a
                    href="/profile/{user.username}"
                    class="flex items-center space-x-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    data-sveltekit-reload
                >
                    <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={user.username}
                        class="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <h3 class="font-semibold">{user.username}</h3>
                    </div>
                </a>
            {/each}
        </div>
    {:else if searchQuery && !loading}
        <div class="text-center py-8 text-gray-500">
            No users found matching "{searchQuery}"
        </div>
    {:else if !searchQuery}
        <div class="text-center py-8 text-gray-500">
            Search for users to connect with...
        </div>
    {/if}
</div> 