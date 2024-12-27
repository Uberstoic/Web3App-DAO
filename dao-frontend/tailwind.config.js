module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'metamask': "url('/metamask.svg')",
        'walletconnect': "url('/walletconnect.svg')",
      },
    },
  },
  plugins: [],
}
