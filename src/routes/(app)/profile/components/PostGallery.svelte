<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { createIntersectionObserver } from '$lib/utils/intersectionObserver';
    
    export let userId;
    
    let posts = [];
    let loading = true;
    let loadingMore = false;
    let hasMore = true;
    let page = 1;
    let sortOption = 'newest';
    
    const sortOptions = [
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'most_liked', label: 'Most liked' },
        { value: 'most_commented', label: 'Most commented' }
    ];

    async function loadPosts(reset = false) {
        if (reset) {
            page = 1;
            posts = [];
            hasMore = true;
        }

        const isInitialLoad = page === 1;
        if (isInitialLoad) {
            loading = true;
        } else {
            loadingMore = true;
        }

        try {
            const response = await fetch(`/api/posts/user?page=${page}&limit=9&sort=${sortOption}`);
            if (response.ok) {
                const data = await response.json();
                if (reset) {
                    posts = data.posts;
                } else {
                    posts = [...posts, ...data.posts];
                }
                hasMore = data.hasMore;
                page += 1;
            }
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            loading = false;
            loadingMore = false;
        }
    }

    // Handle sort change
    $: if (sortOption) {
        loadPosts(true);
    }

    // Intersection Observer for infinite scroll
    let loadMoreTrigger;
    
    onMount(() => {
        const unsubscribe = createIntersectionObserver(loadMoreTrigger, () => {
            if (!loading && !loadingMore && hasMore) {
                loadPosts();
            }
        });

        loadPosts();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    });
</script>

<div class="space-y-6">
    <!-- Sort Controls -->
    <div class="flex justify-end">
        <select
            bind:value={sortOption}
            class="block w-40 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
            {#each sortOptions as option}
                <option value={option.value}>{option.label}</option>
            {/each}
        </select>
    </div>

    {#if loading && !posts.length}
        <!-- Initial Loading Skeleton -->
        <div class="grid grid-cols-3 gap-1 md:gap-4">
            {#each Array(9) as _}
                <div class="aspect-square bg-gray-100 animate-pulse rounded-lg"></div>
            {/each}
        </div>
    {:else if posts.length > 0}
        <!-- Gallery Grid -->
        <div class="grid grid-cols-3 gap-1 md:gap-4">
            {#each posts as post (post.id)}
                <div 
                    class="aspect-square relative group"
                    transition:fade
                >
                    <!-- Post Preview -->
                    <img
                        src={post.mediaUrl}
                        alt={post.caption || 'Post'}
                        class="object-cover w-full h-full rounded-lg transition-all duration-200 group-hover:brightness-90"
                        loading="lazy"
                    />
                    
                    <!-- Media Type Indicator -->
                    {#if post.type === 'video'}
                        <div class="absolute top-2 right-2 text-white">
                            <svg class="w-6 h-6 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                    {:else if post.mediaUrls?.length > 1}
                        <div class="absolute top-2 right-2 text-white">
                            <svg class="w-6 h-6 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
                            </svg>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>

        <!-- Load More Trigger -->
        {#if hasMore}
            <div 
                bind:this={loadMoreTrigger}
                class="h-20 flex items-center justify-center"
            >
                {#if loadingMore}
                    <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                {/if}
            </div>
        {/if}
    {:else}
        <!-- Empty State -->
        <div class="text-center py-16">
            <div class="text-5xl mb-4">📸</div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">No Posts Yet</h3>
            <p class="text-gray-500 mb-6">Share your first post with your followers</p>
            <a
                href="/create"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
                Create Your First Post
            </a>
        </div>
    {/if}
</div> 