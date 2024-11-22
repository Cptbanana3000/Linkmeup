<script>
    import { goto } from '$app/navigation';
    import CreatePostForm from './components/CreatePostForm.svelte';
    import { fade } from 'svelte/transition';

    let toast = null;

    function handleSuccess(event) {
        showToast('Post created successfully!', 'success');
        goto('/profile');
    }

    function handleError(event) {
        showToast(event.detail || 'Failed to create post', 'error');
    }

    function showToast(message, type = 'success') {
        toast = { message, type, show: true };
        setTimeout(() => {
            toast = null;
        }, 3000);
    }
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Create New Post</h1>
    
    <CreatePostForm
        on:success={handleSuccess}
        on:error={handleError}
    />
</div>

{#if toast?.show}
    <div 
        class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white {toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}"
        transition:fade
        role="alert"
    >
        {toast.message}
    </div>
{/if }