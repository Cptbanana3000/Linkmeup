<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    let status = 'verifying';
    let message = 'Verifying your email...';

    onMount(async () => {
        const token = $page.url.searchParams.get('token');
        
        if (!token) {
            status = 'error';
            message = 'Invalid verification link';
            return;
        }

        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                body: JSON.stringify({ token }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                status = 'error';
                message = data.message || 'Verification failed';
                return;
            }

            status = 'success';
            message = 'Email verified successfully! You can now login.';

        } catch (error) {
            status = 'error';
            message = 'An error occurred during verification';
        }
    });
</script>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
        </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div class="text-center">
                {#if status === 'verifying'}
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                {:else if status === 'success'}
                    <div class="text-green-600 mb-4">✓</div>
                {:else}
                    <div class="text-red-600 mb-4">✗</div>
                {/if}

                <p class="mt-2 text-sm text-gray-600">
                    {message}
                </p>

                {#if status === 'success'}
                    <a 
                        href="/login" 
                        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Go to Login
                    </a>
                {/if}
            </div>
        </div>
    </div>
</div> 