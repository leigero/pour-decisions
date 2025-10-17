import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// This is the main function that will be executed when the Edge Function is called
Deno.serve(async (req) => {
  // 1. Check for the correct HTTP method
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Method Not Allowed',
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
  // 2. Get the Authorization header from the request
  const authHeader = req.headers.get('Authorization');
  // Get the secret key from the environment variables (set via `supabase secrets set`)
  const sharedSecret = Deno.env.get('DELETE_USER_IMAGES_KEY');
  // 3. Check if the secret key matches
  if (!authHeader || authHeader !== `Bearer ${sharedSecret}`) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
  try {
    // 4. If authorized, proceed with the logic
    const { user_id } = await req.json();
    if (!user_id) {
      throw new Error('user_id is required in the request body');
    }
    // Create a Supabase admin client to perform privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    // List all files in the user's folder in the storage bucket
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('user-profile-images')
      .list(user_id);
    if (listError) {
      throw listError;
    }
    // If there are files, prepare a list of their paths for deletion
    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${user_id}/${file.name}`);
      // Delete all the files in the user's folder
      const { error: removeError } = await supabaseAdmin.storage
        .from('user-profile-images')
        .remove(filePaths);
      if (removeError) {
        throw removeError;
      }
    }
    // 5. Return a success response
    return new Response(
      JSON.stringify({
        message: `Successfully processed user ${user_id}`,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    // Handle any errors that occur during the process
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
