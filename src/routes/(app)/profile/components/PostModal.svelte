<script>
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    import { token } from '$lib/stores/auth.js';
    import { timeAgo } from '$lib/utils/timeAgo.js';
    
    export let post;
    export let posts = [];
    export let userId;
    
    const dispatch = createEventDispatcher();
    
    let currentIndex = posts.findIndex(p => p._id === post._id);
    $: currentPost = posts[currentIndex];
    $: isLiked = Array.isArray(currentPost?.likes) && currentPost.likes.includes(userId);

    let comments = [];
    let commentText = '';
    let isSubmittingComment = false;

    async function loadComments() {
        try {
            const response = await fetch(
                `/api/posts/${currentPost._id}/comments`,
                {
                    headers: { 'Authorization': `Bearer ${$token}` }
                }
            );

            if (response.ok) {
                const data = await response.json();
                comments = data.comments;
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    async function handleComment(event) {
        event.preventDefault();
        if (!commentText.trim() || isSubmittingComment) return;

        isSubmittingComment = true;
        try {
            const response = await fetch(`/api/posts/${currentPost._id}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${$token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: commentText.trim() })
            });

            if (response.ok) {
                const data = await response.json();
                comments = [data.comment, ...comments];
                commentText = '';
                
                // Update comment count in the post
                currentPost.comments = (currentPost.comments || 0) + 1;
                posts = [...posts];
                dispatch('update', { post: currentPost });
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            isSubmittingComment = false;
        }
    }

    async function deleteComment(commentId) {
        try {
            const response = await fetch(
                `/api/posts/${currentPost._id}/comments/${commentId}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${$token}` }
                }
            );

            if (response.ok) {
                comments = comments.filter(c => c.id !== commentId);
                
                // Update comment count in the post
                currentPost.comments = Math.max(0, (currentPost.comments || 0) - 1);
                posts = [...posts];
                dispatch('update', { post: currentPost });
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    }

    // Load comments when post changes
    $: if (currentPost?._id) {
        loadComments();
    }

    async function handleLike() {
        try {
            const response = await fetch(`/api/posts/${currentPost._id}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${$token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                // Update the current post
                currentPost.likes = data.likes;
                
                // Update the post in the posts array
                const index = posts.findIndex(p => p._id === currentPost._id);
                if (index !== -1) {
                    posts[index] = { ...posts[index], likes: data.likes };
                    posts = [...posts]; // Trigger reactivity
                }
                
                // Emit update event
                dispatch('update', { post: currentPost });
            }
        } catch (error) {
            console.error('Error updating like:', error);
        }
    }

    function next() {
        if (currentIndex < posts.length - 1) {
            currentIndex++;
            dispatch('update', { post: posts[currentIndex] });
        }
    }

    function previous() {
        if (currentIndex > 0) {
            currentIndex--;
            dispatch('update', { post: posts[currentIndex] });
        }
    }

    function handleKeydown(event) {
        if (event.key === 'ArrowRight') next();
        if (event.key === 'ArrowLeft') previous();
        if (event.key === 'Escape') dispatch('close');
    }

    // Add this helper function
    function getTimeAgo(date) {
        return timeAgo(date);
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div 
    class="fixed inset-0 z-50"
    transition:fade
>
    <!-- Backdrop -->
    <div 
        class="absolute inset-0 bg-black bg-opacity-75"
        on:click={() => dispatch('close')}
        role="presentation"
    ></div>

    <!-- Modal Content -->
    <div 
        class="relative h-full flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label="Post details"
    >
        <div 
            class="relative max-w-4xl w-full h-[80vh] bg-white rounded-lg overflow-hidden"
            role="document"
            aria-label="Post content"
        >
            <div class="h-full flex">
                <!-- Image Section -->
                <div class="w-2/3 bg-black flex items-center justify-center relative">
                    <img 
                        src={posts[currentIndex].mediaUrl} 
                        alt={posts[currentIndex].caption || `Post ${currentIndex + 1} of ${posts.length}`}
                        class="max-h-full max-w-full object-contain"
                    />
                    
                    <!-- Navigation Buttons -->
                    {#if currentIndex > 0}
                        <button 
                            type="button"
                            aria-label="View previous post"
                            class="absolute left-4 p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                            on:click={previous}
                        >
                            <svg 
                                class="w-6 h-6" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                            </svg>
                        </button>
                    {/if}
                    
                    {#if currentIndex < posts.length - 1}
                        <button 
                            type="button"
                            aria-label="View next post"
                            class="absolute right-4 p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                            on:click={next}
                        >
                            <svg 
                                class="w-6 h-6" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                    {/if}

                    <!-- Close button -->
                    <button 
                        type="button"
                        aria-label="Close modal"
                        class="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                        on:click={() => dispatch('close')}
                    >
                        <svg 
                            class="w-6 h-6" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Details Section -->
                <section 
                    class="w-1/3 p-4 border-l flex flex-col h-full"
                    aria-label="Post details"
                >
                    <!-- Post Info -->
                    <div class="mb-4">
                        <h2 class="text-xl font-semibold">Post Details</h2>
                        {#if currentPost.caption}
                            <p class="text-gray-600 mt-2">
                                {currentPost.caption}
                            </p>
                        {/if}
                    </div>

                    <!-- Likes and Comments Count -->
                    <div class="flex space-x-4 text-sm text-gray-500 mb-4">
                        <button
                            type="button"
                            class="flex items-center space-x-1 hover:text-red-500 transition-colors"
                            on:click={handleLike}
                        >
                            <svg 
                                class="w-6 h-6" 
                                fill={isLiked ? 'currentColor' : 'none'} 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    stroke-linecap="round" 
                                    stroke-linejoin="round" 
                                    stroke-width="2" 
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            <span>{currentPost?.likes?.length || 0} likes</span>
                        </button>
                        <div class="flex items-center space-x-1">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
                            </svg>
                            <span>{currentPost.comments || 0} comments</span>
                        </div>
                    </div>

                    <!-- Comments Section -->
                    <div class="flex-grow overflow-y-auto">
                        {#each comments as comment (comment.id)}
                            <div class="flex items-start space-x-2 mb-4 group">
                                <div class="flex-grow">
                                    <div class="flex items-center justify-between">
                                        <span class="font-semibold">{comment.user.username}</span>
                                        {#if comment.user.id === userId}
                                            <button
                                                type="button"
                                                class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                                                on:click={() => deleteComment(comment.id)}
                                                aria-label="Delete comment"
                                                title="Delete comment"
                                            >
                                                <svg 
                                                    class="w-4 h-4" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path 
                                                        stroke-linecap="round" 
                                                        stroke-linejoin="round" 
                                                        stroke-width="2" 
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        {/if}
                                    </div>
                                    <p class="text-gray-600">{comment.content}</p>
                                    <span class="text-xs text-gray-400">
                                        {getTimeAgo(comment.createdAt)}
                                    </span>
                                </div>
                            </div>
                        {/each}
                    </div>

                    <!-- Comment Form -->
                    <form on:submit={handleComment} class="mt-4 border-t pt-4">
                        <div class="flex space-x-2">
                            <input
                                type="text"
                                bind:value={commentText}
                                placeholder="Add a comment..."
                                class="flex-grow px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                maxlength="500"
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim() || isSubmittingComment}
                                class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmittingComment ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    </div>
</div> 