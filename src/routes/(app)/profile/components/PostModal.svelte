<script>
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    
    export let post;
    export let posts = [];
    
    const dispatch = createEventDispatcher();
    
    let currentIndex = posts.findIndex(p => p._id === post._id);

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

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            dispatch('close');
        }
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
        on:click={handleBackdropClick}
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
                    class="w-1/3 p-4 border-l overflow-y-auto"
                    aria-label="Post details"
                >
                    <h2 id="post-details-title" class="text-xl font-semibold mb-4">
                        Post Details
                    </h2>
                    {#if posts[currentIndex].caption}
                        <p class="text-gray-600 mb-4">
                            {posts[currentIndex].caption}
                        </p>
                    {/if}
                    
                    <div 
                        class="flex space-x-4 text-sm text-gray-500"
                        role="group"
                        aria-label="Post statistics"
                    >
                        <span class="flex items-center">
                            <svg 
                                class="w-5 h-5 mr-1" 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                            </svg>
                            {posts[currentIndex].likes} likes
                        </span>
                        <span class="flex items-center">
                            <svg 
                                class="w-5 h-5 mr-1" 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
                            </svg>
                            {posts[currentIndex].comments} comments
                        </span>
                    </div>
                </section>
            </div>
        </div>
    </div>
</div> 