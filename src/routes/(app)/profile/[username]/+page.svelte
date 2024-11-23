<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { token, user as currentUser } from '$lib/stores/auth.js';
    import PostGallery from '../components/PostGallery.svelte';

    let profile = null;
    let loading = true;
    let error = null;
    let userPosts = [];
    let hasMore = false;
    let loadingPosts = false;

    async function loadProfile() {
        try {
            const username = $page.params.username;
            const response = await fetch(`/api/users/${username}`, {
                headers: {
                    'Authorization': `Bearer ${$token}`
                }
            });

            if (response.ok) {
                profile = await response.json();
                // Load posts for this user
                await loadPosts();
            } else if (response.status === 404) {
                error = 'User not found';
            } else {
                error = 'Failed to load profile';
            }
        } catch (err) {
            error = 'Error loading profile';
            console.error(err);
        } finally {
            loading = false;
        }
    }

    async function loadPosts() {
        try {
            const username = $page.params.username;
            loadingPosts = true;
            const response = await fetch(`/api/posts/user/${username}`, {
                headers: {
                    'Authorization': `Bearer ${$token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                userPosts = data.posts;
                hasMore = data.hasMore;
            } else {
                console.error('Failed to load posts');
            }
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            loadingPosts = false;
        }
    }

    onMount(() => {
        loadProfile();
    });
</script>

{#if loading}
    <div class="flex justify-center items-center min-h-screen">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
    </div>
{:else if error}
    <div class="flex justify-center items-center min-h-screen">
        <div class="text-red-500">{error}</div>
    </div>
{:else if profile}
    <div class="min-h-screen bg-[#FDF8F4]">
        <main class="max-w-4xl mx-auto px-4 py-8">
            <div class="bg-white rounded-2xl p-6 shadow-sm">
                <!-- Profile Header -->
                <div class="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                    <!-- Avatar -->
                    <div class="relative">
                        {#if profile.avatar}
                            <img
                                src={profile.avatar}
                                alt="{profile.username}'s avatar"
                                class="h-24 w-24 rounded-full object-cover"
                            />
                        {:else}
                            <div class="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                                <span class="text-gray-500 text-2xl">
                                    {profile.username[0].toUpperCase()}
                                </span>
                            </div>
                        {/if}
                    </div>

                    <!-- Profile Info -->
                    <div class="flex-1 text-center lg:text-left">
                        <div class="flex items-center justify-center lg:justify-start space-x-4">
                            <h1 class="text-2xl font-bold">{profile.username}</h1>
                            {#if profile.isCurrentUser}
                                <a 
                                    href="/profile/edit"
                                    class="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
                                >
                                    Edit Profile
                                </a>
                            {:else}
                                <button 
                                    class="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-secondary"
                                >
                                    Follow
                                </button>
                            {/if}
                        </div>

                        <!-- Stats -->
                        <div class="mt-4 flex justify-center lg:justify-start space-x-6">
                            <div>
                                <span class="font-bold">{profile.postCount}</span> posts
                            </div>
                            <div>
                                <span class="font-bold">{profile.followers}</span> followers
                            </div>
                            <div>
                                <span class="font-bold">{profile.following}</span> following
                            </div>
                        </div>

                        <!-- Bio -->
                        {#if profile.bio}
                            <p class="mt-4 text-gray-600">{profile.bio}</p>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Posts Gallery -->
            <div class="mt-8">
                <PostGallery 
                    posts={userPosts}
                    hasMore={hasMore}
                    loading={loadingPosts}
                />
            </div>
        </main>
    </div>
{/if} 