import {heroui} from '@heroui/theme';
import {nextui} from '@nextui-org/theme';
import type { Config } from "tailwindcss";
import { playTheme } from "./src/core/style/play-theme";
import { uiTheme } from "./src/core/style/ui-theme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/core/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(accordion|dropdown|menu|divider|popover|button|ripple|spinner).js",
    "./node_modules/@heroui/theme/dist/components/*.js"
  ],
  theme: {
    extend: {
      colors: {
        play: playTheme,
        ui: uiTheme,
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        // scripture: the clue, passages, quiz questions
        clue: ["var(--font-reading)", "Georgia", "serif"],
      },
      // one radius for every rectangular control, panel and chip (8px); sheets use 3xl (16px); circles are rounded-full
      borderRadius: {
        DEFAULT: "8px",
        sm: "8px",
        md: "8px",
        lg: "8px",
        xl: "8px",
        "2xl": "8px",
        "3xl": "16px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    nextui({ layout: { radius: { small: "8px", medium: "8px", large: "8px" } } }),
    heroui({ layout: { radius: { small: "8px", medium: "8px", large: "8px" } } }),
  ],
};
export default config;
