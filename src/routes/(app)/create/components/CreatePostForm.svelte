<script>
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    import { token } from '$lib/stores/auth.js';
    
    const dispatch = createEventDispatcher();
    
    let files = [];
    let caption = '';
    let loading = false;
    let previewUrls = [];
    let dragOver = false;

    // Handle file selection
    function handleFileSelect(event) {
        const selectedFiles = event.target.files;
        if (selectedFiles) {
            handleFiles(selectedFiles);
        }
    }

    // Handle drag and drop
    function handleDrop(event) {
        event.preventDefault();
        dragOver = false;
        const items = event.dataTransfer.items;
        const selectedFiles = [];
        
        for (let item of items) {
            if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
                selectedFiles.push(item.getAsFile());
            }
        }
        
        handleFiles(selectedFiles);
    }

    // Process selected files
    function handleFiles(selectedFiles) {
        files = Array.from(selectedFiles);
        previewUrls = files.map(file => URL.createObjectURL(file));
    }

    // Remove file from selection
    function removeFile(index) {
        URL.revokeObjectURL(previewUrls[index]);
        files = files.filter((_, i) => i !== index);
        previewUrls = previewUrls.filter((_, i) => i !== index);
    }

    // Handle form submission
    async function handleSubmit() {
        if (files.length === 0) return;
        
        loading = true;
        const formData = new FormData();
        formData.append('caption', caption);
        
        files.forEach(file => {
            formData.append('mediaFiles', file);
        });

        try {
            const response = await fetch('/api/posts/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${$token}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                dispatch('success', result.post);
                files = [];
                previewUrls = [];
                caption = '';
            } else {
                throw new Error(result.error || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            dispatch('error', error.message);
        } finally {
            loading = false;
        }
    }

    // Cleanup URLs on component destroy
    import { onDestroy } from 'svelte';
    onDestroy(() => {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
    });
</script>

<div class="max-w-2xl mx-auto p-4">
    <form 
        on:submit|preventDefault={handleSubmit}
        class="space-y-6 bg-white rounded-xl shadow-sm p-6"
    >
        <!-- Media Upload Area -->
        <div
            role="region"
            aria-label="File upload drop zone"
            aria-describedby="upload-instructions"
            class="relative border-2 border-dashed rounded-xl p-8 text-center {dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'}"
            on:dragover|preventDefault={() => dragOver = true}
            on:dragleave|preventDefault={() => dragOver = false}
            on:drop|preventDefault={handleDrop}
        >
            <span id="upload-instructions" class="sr-only">
                Drag and drop files here or use the upload button to select files
            </span>
            {#if files.length === 0}
                <div class="space-y-4">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div class="text-sm text-gray-600">
                        <label class="relative cursor-pointer rounded-md font-medium text-primary hover:text-secondary">
                            <span>Upload files</span>
                            <input 
                                type="file" 
                                class="sr-only" 
                                accept="image/*,video/*" 
                                multiple 
                                on:change={handleFileSelect}
                            >
                        </label>
                        <p class="pl-1">or drag and drop</p>
                    </div>
                    <p class="text-xs text-gray-500">
                        Images and videos up to 10MB
                    </p>
                </div>
            {:else}
                <!-- Preview Grid -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {#each previewUrls as url, index (url)}
                        <div 
                            class="relative aspect-square rounded-lg overflow-hidden group"
                            transition:fade
                        >
                            <img
                                src={url}
                                alt="Preview"
                                class="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                aria-label="Remove image"
                                class="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                on:click={() => removeFile(index)}
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    {/each}
                    
                    <!-- Add More Button -->
                    <label 
                        class="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary"
                        aria-label="Add more files"
                    >
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <input 
                            type="file" 
                            class="sr-only" 
                            accept="image/*,video/*" 
                            multiple 
                            on:change={handleFileSelect}
                        >
                    </label>
                </div>
            {/if}
        </div>

        <!-- Caption Input -->
        <div>
            <label for="caption" class="block text-sm font-medium text-gray-700">
                Caption
            </label>
            <div class="mt-1">
                <textarea
                    id="caption"
                    bind:value={caption}
                    rows="3"
                    class="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg"
                    placeholder="Write a caption..."
                ></textarea>
            </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
            <button
                type="submit"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={files.length === 0 || loading}
            >
                {#if loading}
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating post...
                {:else}
                    Share Post
                {/if}
            </button>
        </div>
    </form>
</div> 