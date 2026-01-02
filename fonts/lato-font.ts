import localFont from 'next/font/local';

const latoFont = localFont({
  src: [
    {
      path: '../public/fonts/Lato-Black.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-lato',
});

export default latoFont;
