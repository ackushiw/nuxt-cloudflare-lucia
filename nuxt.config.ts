// https://nuxt.com/docs/api/configuration/nuxt-config
console.dir(
  {
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  }
)
export default defineNuxtConfig({
  modules: ["@nuxt/devtools", "@nuxt/ui", '@vueuse/nuxt', "nitro-cloudflare-dev"],

  nitro: {
    preset: 'cloudflare-pages'
  },

  runtimeConfig: {
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  },

  vite: {
    optimizeDeps: {
      exclude: ["oslo"]
    }
  }
})
