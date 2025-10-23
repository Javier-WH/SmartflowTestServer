import React from 'react';


export interface BotonProps {
  text?: string;
  icon?: React.ReactNode;
  title?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  height?: string;
  width?: string;
  borderless?: boolean;
  danger?: boolean;
  neutral?: boolean;
  textSize?: string;
  trasparent?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}


/**
 * A custom button component with various styling options.
 * @param {string} [text=''] - The text content of the button.
 * @param {React.ReactNode} [icon] - The icon element of the button.
 * @param {string} [title=''] - The title attribute of the button.
 * @param {React.MouseEventHandler<HTMLButtonElement>} [onClick] - The click event handler of the button.
 * @param {string} [height='h-10'] - The height of the button.
 * @param {string} [width='w-auto'] - The width of the button.
 * @param {boolean} [borderless=false] - If true, the button will have no border.
 * @param {boolean} [danger=false] - If true, the button will have a danger background and white text.
 * @param {boolean} [neutral=false] - If true, the button will have a neutral background and white text.
 * @param {string} [textSize] - The font size of the button.
 * @param {boolean} [trasparent=false] - If true, the button will have a transparent background.
 */
export const Boton: React.FC<BotonProps> = ({
  text = '',
  icon,
  title = '',
  onClick,
  height = 'h-10',
  width = 'w-auto',
  borderless = false,
  danger = false,
  neutral = false,
  textSize,
  trasparent = false,
  type = 'button',
  disabled = false
}) => {

  const baseClasses: string = 'flex items-center justify-center font-semibold transition duration-150 ease-in-out cursor-pointer focus:outline-none';

  // Logic to determine **background** and **text** color (Base state)
  // CLAVE: Se agregó 'bg-white' o 'bg-[var(--backgroundColor)]' en el estado neutral
  const backgroundAndTextColor = trasparent
    ? 'bg-transparent text-[var(--buttonTextColor)]' // Transparent: Fondo transparente
    : neutral
      ? 'bg-white text-[var(--backGroundNeutralColor)]' // <-- CORREGIDO: Se agregó bg-white (o el color de fondo base)
      : danger
        ? 'bg-[var(--backGroundDangerColor)] text-white'
        : 'bg-[var(--backgroundColor)] text-[var(--buttonTextColor)]';

  // Conditional Border Classes based on the 'borderless' prop (Base state)
  const borderClasses = borderless
    ? 'border-0'
    : trasparent
      ? `border border-[var(--buttonborderColor)]` // Transparente: Borde de color primario
      : neutral
        ? `border border-[var(--backGroundNeutralColor)]`
        : danger
          ? `border border-[var(--backGroundDangerColor)]`
          : `border border-[var(--buttonborderColor)]`;
  // --------------------------------------------------------------------


  // --------------------------------------------------------------------
  // Logic to determine **hover** colors (Inversion or subtle)
  let hoverBgClass: string = '';
  let hoverTextClass: string = '';
  let hoverBorderClass: string = '';

  // Determine if the button has text content (different from empty string)
  const hasTextContent = text === 'empty' || !!text;

  if (trasparent) {

    hoverBgClass = 'hover:bg-[var(--backgroundColor)]';
    hoverTextClass = 'hover:text-[var(--buttonTextColor)]';
    if (!borderless) {
      hoverBorderClass = 'hover:border-[var(--buttonTextColor)]';
    }
  } else if (hasTextContent) {
    // --------------------------------
    // Apply Color Inversion
    // --------------------------------
    if (neutral) {
      // Neutral: The button is an outline. On hover, it inverts to solid neutral background and white text.
      hoverBgClass = 'hover:bg-[var(--backGroundNeutralColor)]';
      hoverTextClass = 'hover:text-white';
      if (!borderless) {
        hoverBorderClass = 'hover:border-[var(--backGroundNeutralColor)]';
      }
    } else if (danger) {
      // Danger: The button is solid. On hover, it inverts to white background and danger text.
      hoverBgClass = 'hover:bg-white';
      hoverTextClass = 'hover:text-[var(--backGroundDangerColor)]';
      if (!borderless) {
        hoverBorderClass = 'hover:border-white';
      }
    } else {
      // Default (Primary): The button is solid. On hover, it inverts.
      hoverBgClass = 'hover:bg-[var(--buttonTextColor)]';
      hoverTextClass = 'hover:text-[var(--backgroundColor)]';
      if (!borderless) {
        hoverBorderClass = 'hover:border-[var(--buttonTextColor)]';
      }
    }
  } else {
    // --------------------------------
    // Apply Subtle Hover (No Inversion) - For Icon-Only Buttons
    // --------------------------------
    // If there is no text (icon only or empty), apply a subtle hover (brightness)
    hoverBgClass = 'hover:brightness-[0.98]';
  }
  // --------------------------------------------------------------------


  // Appearance classes using CSS Variables (Arbitrary Values)
  const appearanceClasses: string = `
   ${backgroundAndTextColor} 
   ${borderClasses}
  ${hoverBgClass} ${hoverTextClass} ${hoverBorderClass}
   active:brightness-90 
  `.replace(/\s+/g, ' ').trim(); // Cleanup spaces for a clean class string

  // Dimension classes injected + default horizontal padding (px-4)
  const sizeClasses: string = `${height} ${width} px-4`;

  // Combine all classes
  const combinedClasses = `${baseClasses} ${appearanceClasses} ${sizeClasses}`;

  // ----------------------------------------------------
  // Logic for font size:
  // Uses the 'textSize' value if provided, otherwise, 
  // uses the root CSS variable.
  const buttonFontSize: string = textSize || 'var(--butonTextSize)';
  // ----------------------------------------------------

  // Applies styles to the SVG element within the span:
  // - stroke-current: Makes the stroke color inherit the text color (including hover).
  // - stroke-[1px]: Sets the stroke thickness to 1px.
  const iconStyleClasses = '[&>svg]:stroke-current [&>svg]:stroke-[1px]';

  // Apply border thickness, box shadow, border radius, and FONT SIZE using inline style.
  const customStyle: React.CSSProperties = {

    fontSize: buttonFontSize,

    borderRadius: 'var(--cornetRounded)',
    ...(borderless ? {} : {
      boxShadow: 'var(--boxShadow)',
      borderWidth: 'var(--buttonBorderThickness)'
    })
  };


  const iconElement = icon ? (
    <span className={`${text ? 'mr-2' : ''} ${iconStyleClasses}`}>{icon}</span>
  ) : null;


  return (
    <button
      className={combinedClasses}
      style={customStyle}
      title={title}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {iconElement}
      {
        text.length > 0  &&
        <span>{ text }</span>
      }
    </button>
  );
};

export default Boton;