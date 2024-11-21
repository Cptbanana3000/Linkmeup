<script>
    // Create post logic will go here
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Create New Post</h1>
    <div class="bg-white rounded-xl shadow p-6">
        <form class="space-y-6">
            <div>
                <label for="content" class="block text-sm font-medium text-gray-700">
                    What's on your mind?
                </label>
                <div class="mt-1">
                    <textarea
                        id="content"
                        name="content"
                        rows="4"
                        class="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg"
                        placeholder="Share your thoughts..."
                    ></textarea>
                </div>
            </div>
            <div class="flex justify-end">
                <button
                    type="submit"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Post
                </button>
            </div>
        </form>
    </div>
</div> 