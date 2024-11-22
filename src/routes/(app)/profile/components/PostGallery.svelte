<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { token } from '$lib/stores/auth.js';
    
    let posts = [];
    let loading = true;
    let hasMore = true;
    let page = 1;

    async function loadPosts() {
        try {
            const response = await fetch(`/api/posts/user?page=${page}&limit=9`, {
                headers: {
                    'Authorization': `Bearer ${$token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                posts = [...posts, ...data.posts];
                hasMore = data.hasMore;
                page += 1;
            } else if (response.status === 401) {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadPosts();
    });
</script>

<div class="space-y-6">
    {#if loading && !posts.length}
        <div class="grid grid-cols-3 gap-1 md:gap-4">
            {#each Array(9) as _}
                <div class="aspect-square bg-gray-100 animate-pulse rounded-lg"></div>
            {/each}
        </div>
    {:else if posts.length > 0}
        <div class="grid grid-cols-3 gap-1 md:gap-4">
            {#each posts as post (post._id)}
                <div 
                    class="aspect-square relative group"
                    transition:fade
                >
                    <img
                        src={post.mediaUrl}
                        alt={post.caption || 'Post'}
                        class="object-cover w-full h-full rounded-lg"
                        loading="lazy"
                    />
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                        <div class="hidden group-hover:flex space-x-4 text-white">
                            <div class="flex items-center">
                                <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                                </svg>
                                <span>{post.likes}</span>
                            </div>
                            <div class="flex items-center">
                                <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
                                </svg>
                                <span>{post.comments}</span>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <div class="text-center py-8">
            <p class="text-gray-500">No posts yet</p>
            <a
                href="/create"
                class="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary"
            >
                Create Your First Post
            </a>
        </div>
    {/if}
</div> 