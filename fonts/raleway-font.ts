import localFont from 'next/font/local';

const ralewayFont = localFont({
  src: [
    {
      path: '../public/fonts/Raleway-VariableFont_wght.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-raleway',
});

export default ralewayFont;
