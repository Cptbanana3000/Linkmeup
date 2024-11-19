<script>
    import { onMount } from 'svelte';
    // export let data;
    let loaded = false;

    onMount(() => {
        loaded = true;
    });
</script>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check Your Email
        </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div class="text-center">
                <div class="text-green-600 mb-4">✓</div>
                <h3 class="text-lg font-medium text-gray-900">Registration successful!</h3>
                <p class="mt-2 text-sm text-gray-600">
                    We've sent a verification link to your email address. 
                    Please check your inbox and click the link to verify your account.
                </p>
                <p class="mt-4 text-sm text-gray-500">
                    Didn't receive the email? Check your spam folder or 
                    <button class="text-primary hover:text-secondary">resend verification email</button>
                </p>
            </div>
        </div>
    </div>
</div> 