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
        clue: ["var(--font-reading)", "Georgia", "serif"],
      },
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
