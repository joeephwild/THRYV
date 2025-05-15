/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'boxing': ['Boxing-Regular'],
        'cabinet': ['CabinetGrotesk-Regular'],
        'cabinet-thin': ['CabinetGrotesk-Thin'],
        'cabinet-light': ['CabinetGrotesk-Light'],
        'cabinet-medium': ['CabinetGrotesk-Medium'],
        'cabinet-bold': ['CabinetGrotesk-Bold'],
        'cabinet-black': ['CabinetGrotesk-Black'],
        'cabinet-extrabold': ['CabinetGrotesk-Extrabold'],
        'cabinet-extralight': ['CabinetGrotesk-Extralight'],
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
