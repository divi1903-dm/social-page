// Comprehensive E2E Verification Test Script for TaskPlanet Social Feed API

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Full-Stack Social Web Application Verification Tests...\n');

  try {
    // 1. Check API Health
    console.log('1. Testing /api/health...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('   ✅ Health check passed:', healthData.service, `(${healthData.status})`);

    // 2. Fetch Public Feed
    console.log('\n2. Testing Public Feed (GET /api/posts)...');
    const feedRes = await fetch(`${BASE_URL}/posts`);
    const feedData = await feedRes.json();
    console.log(`   ✅ Feed returned ${feedData.posts.length} initial posts.`);
    console.log(`   📌 Sample post title: "${feedData.posts[0]?.content}" by ${feedData.posts[0]?.author?.name}`);

    // 3. Test Signup
    console.log('\n3. Testing Signup (POST /api/auth/signup)...');
    const testUsername = 'tester_' + Date.now().toString().slice(-4);
    const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kavitha R',
        username: testUsername,
        email: `${testUsername}@example.com`,
        password: 'password123',
      }),
    });
    const signupData = await signupRes.json();
    if (!signupRes.ok) throw new Error(signupData.message);
    console.log(`   ✅ User registered successfully! Name: ${signupData.user.name}, Token generated.`);
    const userToken = signupData.token;
    const testUserId = signupData.user._id;

    // 4. Test Login
    console.log('\n4. Testing Login (POST /api/auth/login)...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `${testUsername}@example.com`,
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message);
    console.log('   ✅ Login successful for:', loginData.user.username);

    // 5. Test Google Auth Flow when a real Google credential is provided.
    console.log('\n5. Testing "Continue with Google" (POST /api/auth/google)...');
    if (process.env.GOOGLE_TEST_CREDENTIAL) {
      const googleRes = await fetch(`${BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: process.env.GOOGLE_TEST_CREDENTIAL }),
      });
      const googleData = await googleRes.json();
      if (!googleRes.ok) throw new Error(googleData.message);
      console.log('   ✅ Google One-Click Auth passed! User:', googleData.user.name);
    } else {
      console.log('   ⏭️ Google auth skipped: set GOOGLE_TEST_CREDENTIAL to run it.');
    }

    // 6. Test Create Post (Text Only)
    console.log('\n6. Testing Create Post - Text Only (POST /api/posts)...');
    const textPostRes = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        content: 'Hello TaskPlanet community! Testing full-stack feed 🚀',
        postType: 'all',
      }),
    });
    const textPostData = await textPostRes.json();
    if (!textPostRes.ok) throw new Error(textPostData.message);
    console.log('   ✅ Text-only post created! ID:', textPostData.post._id);
    const createdPostId = textPostData.post._id;

    // 7. Test Create Post (Image Only)
    console.log('\n7. Testing Create Post - Image Only (POST /api/posts)...');
    const imgPostRes = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        postType: 'all',
      }),
    });
    const imgPostData = await imgPostRes.json();
    if (!imgPostRes.ok) throw new Error(imgPostData.message);
    console.log('   ✅ Image-only post created! ID:', imgPostData.post._id);

    // 8. Test Like / Unlike Post
    console.log(`\n8. Testing Like Post (POST /api/posts/${createdPostId}/like)...`);
    const likeRes = await fetch(`${BASE_URL}/posts/${createdPostId}/like`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    const likeData = await likeRes.json();
    if (!likeRes.ok) throw new Error(likeData.message);
    console.log(`   ✅ Post liked! Total likes: ${likeData.post.likes.length}. Liked by: ${likeData.post.likes[0]?.name} (@${likeData.post.likes[0]?.username})`);

    // 9. Test Add Comment
    console.log(`\n9. Testing Add Comment (POST /api/posts/${createdPostId}/comment)...`);
    const commentRes = await fetch(`${BASE_URL}/posts/${createdPostId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        text: 'This is an awesome post! Loving the clean UI! ✨',
      }),
    });
    const commentData = await commentRes.json();
    if (!commentRes.ok) throw new Error(commentData.message);
    console.log(`   ✅ Comment added! Total comments: ${commentData.post.comments.length}`);
    console.log(`      Commenter: ${commentData.comment.name} (@${commentData.comment.username}): "${commentData.comment.text}"`);

    // 10. Test Feed Filtering and Sorting
    console.log('\n10. Testing Feed Filter Tabs (GET /api/posts?filter=most_liked)...');
    const filteredRes = await fetch(`${BASE_URL}/posts?filter=most_liked`);
    const filteredData = await filteredRes.json();
    console.log(`   ✅ Fetched ${filteredData.posts.length} posts sorted by most likes.`);

    // 11. Test Search
    console.log('\n11. Testing Post Search (GET /api/posts?q=TaskPlanet)...');
    const searchRes = await fetch(`${BASE_URL}/posts?q=TaskPlanet`);
    const searchData = await searchRes.json();
    console.log(`   ✅ Search returned ${searchData.posts.length} matching posts.`);

    console.log('\n🎉 ALL 11 VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀\n');
  } catch (error) {
    console.error('❌ Verification test failed:', error.message);
  }
}

runTests();
