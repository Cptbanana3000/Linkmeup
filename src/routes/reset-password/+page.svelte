<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    let password = '';
    let confirmPassword = '';
    let loading = false;
    let error = null;
    let success = false;

    async function handleSubmit() {
        loading = true;
        error = null;

        if (password !== confirmPassword) {
            error = 'Passwords do not match';
            loading = false;
            return;
        }

        const token = $page.url.searchParams.get('token');
        if (!token) {
            error = 'Invalid reset token';
            loading = false;
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            success = true;
            setTimeout(() => {
                goto('/login');
            }, 3000);
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen bg-[#FDF8F4] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900" aria-label="Reset password page heading">
            Reset your password
        </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {#if success}
                <div class="rounded-md bg-green-50 p-4" role="alert">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm font-medium text-green-800">
                                Password reset successful! Redirecting to login...
                            </p>
                        </div>
                    </div>
                </div>
            {:else}
                <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700" aria-label="New password input field">
                            New Password
                        </label>
                        <div class="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                bind:value={password}
                                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                aria-label="Enter your new password"
                            />
                        </div>
                    </div>

                    <div>
                        <label for="confirm-password" class="block text-sm font-medium text-gray-700" aria-label="Confirm password input field">
                            Confirm Password
                        </label>
                        <div class="mt-1">
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                required
                                bind:value={confirmPassword}
                                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                aria-label="Confirm your new password"
                            />
                        </div>
                    </div>

                    {#if error}
                        <div class="rounded-md bg-red-50 p-4" role="alert">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm font-medium text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                            aria-label={loading ? 'Resetting password...' : 'Reset password'}
                        >
                            {loading ? 'Resetting password...' : 'Reset password'}
                        </button>
                    </div>
                </form>
            {/if}
        </div>
    </div>
</div> 