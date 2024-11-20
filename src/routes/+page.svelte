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

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your LinkMeUp Account
        </h2>
       
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
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
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
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
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
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
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
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
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                    </div>
                    {#if errors.confirmPassword}
                        <p class="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                    {/if}
                </div>

                {#if errors.general}
                    <div class="text-red-600 text-sm">{errors.general}</div>
                {/if}

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </div>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Already have an account?
                    <a href="/login" class="font-medium text-primary hover:text-secondary" aria-label="Navigate to registration page">
                        Login
                    </a>
                </p>
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
                    <button class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <img class="h-5 w-5" src="/google.svg" alt="Google logo" />
                    </button>
                    <button class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <img class="h-5 w-5" src="/github-mark.svg" alt="GitHub logo" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
