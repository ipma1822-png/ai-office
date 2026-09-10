// Kakao OAuth repair helper v1
// Isolated helper for verification before touching aria-memory.js on main.
window.AIOfficeKakaoAuthRepair = Object.freeze({
  version:'1.0.0',
  async signIn(db, returnUrl){
    if(!db) throw new Error('Supabase client is required.');
    const { data, error } = await db.auth.signInWithOAuth({
      provider:'kakao',
      options:{ redirectTo:returnUrl }
    });
    if(error) throw error;
    return data;
  }
});
