import localFont from 'next/font/local';

const interFont = localFont({
  src: [
    {
      path: '../public/fonts/Inter-VariableFont_opsz,wght.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
});

export default interFont;
