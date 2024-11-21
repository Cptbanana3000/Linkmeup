<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let profile = {
        username: '',
        avatar: null,
        bio: '',
        followers: 0,
        following: 0
    };

    let isEditing = false;
    let editForm = { ...profile };
    let avatarFile = null;
    let loading = false;
    let loadingProfile = true;

    function getAuthToken() {
        const token = localStorage.getItem('token');
        if (!token) {
            goto('/login');
            return null;
        }
        return token;
    }

    async function loadProfile() {
        const token = getAuthToken();
        if (!token) return;

        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                profile = data;
                editForm = { ...data };
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                goto('/login');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            loadingProfile = false;
        }
    }

    onMount(() => {
        loadProfile();
    });

    async function handleAvatarChange(event) {
        const file = event.target.files[0];
        if (file) {
            avatarFile = file;
            // Show preview
            editForm.avatar = URL.createObjectURL(file);
        }
    }

    async function handleEditSubmit() {
        loading = true;
        try {
            const token = getAuthToken();
            if (!token) return;

            const formData = new FormData();
            formData.append('username', editForm.username);
            formData.append('bio', editForm.bio);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const response = await fetch('/api/profile/update', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                profile = { ...profile, ...data };
                isEditing = false;
                await loadProfile();
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                goto('/login');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            loading = false;
        }
    }
</script>

{#if loadingProfile}
    <div class="min-h-screen bg-[#FDF8F4] flex items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
{:else}
    <div class="min-h-screen bg-[#FDF8F4] flex flex-col lg:flex-row">
        <aside class="w-full lg:w-64 fixed bottom-0 lg:static h-16 lg:h-full border-t lg:border-r border-gray-200 bg-white lg:bg-white z-50">
            <div class="flex lg:flex-col h-full px-4 py-2 lg:py-6">
                <div class="hidden lg:block mb-8">
                    <h1 class="text-xl font-bold">LinkMeUp</h1>
                </div>
                
                <nav class="flex-1 flex lg:block space-x-4 lg:space-x-0 lg:space-y-2 justify-around lg:justify-start" aria-label="Main navigation">
                    <a 
                        href="/home" 
                        class="flex items-center px-4 py-2 text-gray-700 rounded-xl hover:bg-[#FDF8F4] transition-colors"
                        aria-label="Go to home page"
                    >
                        Home
                    </a>
                    <!-- More menu items -->
                </nav>
            </div>
        </aside>

        <main class="flex-1 py-6 px-4 lg:px-6 mb-16 lg:mb-0 lg:ml-64">
            <div class="max-w-4xl mx-auto">
                <div class="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
                    {#if !isEditing}
                        <div class="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-4">
                            <div class="relative" aria-label="Profile picture">
                                {#if profile.avatar}
                                    <img 
                                        src={profile.avatar} 
                                        alt="Profile" 
                                        class="w-24 h-24 rounded-full object-cover"
                                    />
                                {:else}
                                    <div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                                        <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                {/if}
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center justify-between">
                                    <h2 class="text-xl font-bold text-gray-900">{profile.username}</h2>
                                    <button 
                                        class="text-sm px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                                        on:click={() => {
                                            editForm = { ...profile };
                                            isEditing = true;
                                        }}
                                        aria-label="Edit profile"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                                <p class="mt-1 text-gray-600">{profile.bio}</p>
                                <div class="mt-4 flex space-x-4">
                                    <button 
                                        class="text-sm text-gray-700"
                                        aria-label={`${profile.followers} followers`}
                                    >
                                        <span class="font-bold">{profile.followers}</span> followers
                                    </button>
                                    <button 
                                        class="text-sm text-gray-700"
                                        aria-label={`${profile.following} following`}
                                    >
                                        <span class="font-bold">{profile.following}</span> following
                                    </button>
                                </div>
                            </div>
                        </div>
                    {:else}
                        <form on:submit|preventDefault={handleEditSubmit} class="space-y-4">
                            <div class="flex items-start space-x-4">
                                <div class="relative" aria-label="Profile picture">
                                    <img 
                                        src={editForm.avatar} 
                                        alt="Profile" 
                                        class="w-24 h-24 rounded-full object-cover"
                                    />
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        class="hidden" 
                                        id="avatar-upload"
                                        on:change={handleAvatarChange}
                                        aria-label="Upload new profile picture"
                                    />
                                    <label 
                                        for="avatar-upload"
                                        class="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm cursor-pointer hover:bg-gray-50"
                                        aria-label="Change profile picture"
                                    >
                                        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </label>
                                </div>
                                <div class="flex-1 space-y-3">
                                    <div>
                                        <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                                        <input 
                                            type="text" 
                                            id="username"
                                            bind:value={editForm.username}
                                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                            aria-label="Edit username"
                                        />
                                    </div>
                                    <div>
                                        <label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
                                        <textarea 
                                            id="bio"
                                            bind:value={editForm.bio}
                                            rows="3"
                                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                            aria-label="Edit bio"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-end space-x-3">
                                <button 
                                    type="button"
                                    class="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                                    on:click={() => isEditing = false}
                                    aria-label="Cancel editing"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    class="px-4 py-2 text-sm text-white bg-primary hover:bg-secondary rounded-xl transition-colors"
                                    disabled={loading}
                                    aria-label={loading ? 'Saving changes...' : 'Save changes'}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    {/if}
                </div>
            </div>
        </main>
    </div>
{/if} 


<!-- additons hehe-->