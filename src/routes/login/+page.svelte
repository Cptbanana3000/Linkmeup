<script>
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';

    let formData = {
        email: '',
        password: ''
    };

    let errors = {};
    let loading = false;

    async function handleSubmit() {
        loading = true;
        errors = {};

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                errors = data.errors || { general: data.message || 'Login failed' };
                return;
            }

            // Store the token in localStorage
            localStorage.setItem('authToken', data.token);
            goto('/dashboard');

        } catch (error) {
            console.error('Login error:', error);
            errors.general = 'An error occurred during login';
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900" aria-label="Login page heading">
            Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
            Or
            <a href="/" class="font-medium text-primary hover:text-secondary" aria-label="Navigate to registration page">
                create a new account
            </a>
        </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700" aria-label="Email input field">
                        Email address
                    </label>
                    <div class="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autocomplete="email"
                            required
                            bind:value={formData.email}
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            aria-label="Enter your email"
                        />
                    </div>
                    {#if errors.email}
                        <p class="mt-2 text-sm text-red-600" role="alert">{errors.email}</p>
                    {/if}
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700" aria-label="Password input field">
                        Password
                    </label>
                    <div class="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autocomplete="current-password"
                            required
                            bind:value={formData.password}
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            aria-label="Enter your password"
                        />
                    </div>
                    {#if errors.password}
                        <p class="mt-2 text-sm text-red-600" role="alert">{errors.password}</p>
                    {/if}
                </div>

                <div class="flex items-center justify-between">
                    <div class="text-sm">
                        <a href="/forgot-password" class="font-medium text-primary hover:text-secondary" aria-label="Navigate to forgot password page">
                            Forgot your password?
                        </a>
                    </div>
                </div>

                {#if errors.general}
                    <div class="text-red-600 text-sm" role="alert">{errors.general}</div>
                {/if}

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        aria-label={loading ? 'Signing in...' : 'Sign in'}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>
            </form>

            <div class="mt-6">
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div class="mt-6 grid grid-cols-2 gap-3">
                    <button 
                        class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        aria-label="Sign in with Google"
                    >
                        <img class="h-5 w-5" src="/google.svg" alt="Google logo" />
                    </button>
                    <button 
                        class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        aria-label="Sign in with GitHub"
                    >
                        <img class="h-5 w-5" src="/github-mark.svg" alt="GitHub logo" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</div> 