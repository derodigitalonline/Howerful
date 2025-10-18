interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-8 w-8" }: LogoProps) {
  return (
    <svg width="32" height="32" viewBox="0 0 38 38 " fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.75 6.25L3.075 19.2969H9.14844L13.75 11.25L16.25 15V11.25L13.75 6.25ZM26.25 6.25L23.75 11.25V15L26.25 11.25L30.8516 19.2969H36.9219L26.25 6.25ZM1.95312 20.7031V34.2969H17.125L20 29.9844L22.875 34.2969H38.0469V20.7031H1.95312ZM3.75 22.5H17.5V27.5L15 32.5H3.75V22.5ZM22.5 22.5H36.25V32.5H25L22.5 27.5V22.5Z" fill="black"/>
</svg>

  );
}
