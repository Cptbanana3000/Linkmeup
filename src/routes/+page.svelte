<script>
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';

    let formData = {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    };

    let errors = {};
    let loading = false;

    function validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const validations = [];

        if (password.length < minLength) validations.push('At least 8 characters');
        if (!hasUpperCase) validations.push('One uppercase letter');
        if (!hasLowerCase) validations.push('One lowercase letter');
        if (!hasNumbers) validations.push('One number');
        if (!hasSpecialChar) validations.push('One special character');

        return validations;
    }

    async function handleSubmit() {
        loading = true;
        errors = {};

        // Password validation
        const passwordValidations = validatePassword(formData.password);
        if (passwordValidations.length > 0) {
            errors.password = passwordValidations;
            loading = false;
            return;
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
            loading = false;
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                }) // Only send necessary data
            });

            const data = await response.json();
            console.log('Registration response:', data); // Add this for debugging

            if (!response.ok) {
                errors = data.errors || { general: 'Registration failed' };
                loading = false;
                return;
            }

            if (data.success) {
                window.location.href = '/check-email'; // Use window.location instead of goto
            }

        } catch (error) {
            console.error('Registration error:', error);
            errors.general = 'An error occurred during registration';
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex bg-[#FDF8F4]">
    <!-- Left Side - Brand Message -->
    <div class="hidden lg:flex lg:w-1/2 flex-col justify-center px-12">
        <div class="max-w-md mx-auto">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">
                Connect. Share. Grow.
            </h1>
            <p class="text-xl text-gray-700 mb-8">
                Join our community where meaningful connections happen. Share your stories, ideas, and experiences in a space designed for genuine interactions.
            </p>
            <div class="space-y-4 text-gray-700">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span>Create your unique digital space</span>
                </div>
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                    </svg>
                    <span>Connect with like-minded people</span>
                </div>
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                    </svg>
                    <span>Share your thoughts seamlessly</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Right Side - Registration Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div class="w-full max-w-md bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-sm">
            <div class="text-center mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">
                    Create your LinkMeUp Account
                </h2>
                <p class="text-gray-600 text-sm">
                    Start your journey with us today
                </p>
            </div>

            <form class="space-y-5" on:submit|preventDefault={handleSubmit}>
                <!-- Username field -->
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700">
                        Username
                    </label>
                    <div class="mt-1">
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            bind:value={formData.username}
                            class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Choose a username"
                        />
                    </div>
                    {#if errors.username}
                        <p class="mt-2 text-sm text-red-600">{errors.username}</p>
                    {/if}
                </div>

                <!-- Email field -->
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">
                        Email address
                    </label>
                    <div class="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            bind:value={formData.email}
                            class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="name@example.com"
                        />
                    </div>
                    {#if errors.email}
                        <p class="mt-2 text-sm text-red-600">{errors.email}</p>
                    {/if}
                </div>

                <!-- Password field -->
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div class="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            bind:value={formData.password}
                            class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Choose a password"
                        />
                    </div>
                    {#if errors.password}
                        <ul class="mt-2 text-sm text-red-600">
                            {#each errors.password as error}
                                <li>{error}</li>
                            {/each}
                        </ul>
                    {/if}
                </div>

                <!-- Confirm Password field -->
                <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                        Confirm Password
                    </label>
                    <div class="mt-1">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            bind:value={formData.confirmPassword}
                            class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Confirm your password"
                        />
                    </div>
                    {#if errors.confirmPassword}
                        <p class="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                    {/if}
                </div>

                {#if errors.general}
                    <div class="text-red-600 text-sm">{errors.general}</div>
                {/if}

                <div class="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </div>
                <p class="text-center text-sm text-gray-600 pt-1">
                    Already have an account?
                    <a href="/login" class="font-medium text-primary hover:text-secondary">
                        Login
                    </a>
                </p>
            </form>

            <div class="mt-6">
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-200"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-4 bg-white text-gray-500">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div class="mt-5 grid grid-cols-2 gap-3">
                    <button class="w-full inline-flex justify-center items-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-colors">
                        <img class="h-5 w-5" src="/google.svg" alt="Google logo" />
                    </button>
                    <button class="w-full inline-flex justify-center items-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-colors">
                        <img class="h-5 w-5" src="/github-mark.svg" alt="GitHub logo" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
