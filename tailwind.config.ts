import {heroui} from '@heroui/theme';
import {nextui} from '@nextui-org/theme';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(accordion|dropdown|menu|divider|popover|button|ripple|spinner).js",
    "./node_modules/@heroui/theme/dist/components/(autocomplete|date-picker|number-input|pagination|toast|button|ripple|spinner|form|input|listbox|divider|popover|scroll-shadow|calendar|date-input).js"
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [nextui(),heroui()],
};
export default config;
