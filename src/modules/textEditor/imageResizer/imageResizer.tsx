/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

export default function ImageResizer({ image }: { image: HTMLImageElement | null}) {

  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);



  const resizerStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    //border: '1px solid #000',
  }

  useEffect(() => {
    if (!image) {
      setContainer(null);
    }
    setContainer(image?.parentElement?.parentElement as HTMLDivElement | null);
   }, [image]);

   useEffect(() => {
    if (!container) return

    const fixSizerOnScroll = () => {
      if (image) {
        //obtainer image parent
        const marginleft = container?.getBoundingClientRect().left
        console.log(container?.getBoundingClientRect().left);
        setTop(145 + image.offsetTop - (container?.scrollTop || 0));
        setLeft(image.offsetLeft + (marginleft || 0));
        setWidth(image.offsetWidth);
        setHeight(image.offsetHeight);
      }
      else {
        setTop(0);
        setLeft(0);
        setWidth(0);
        setHeight(0);
      }

    }


     container.addEventListener('scroll', fixSizerOnScroll)

     return () => {
       container.removeEventListener('scroll', fixSizerOnScroll)
     }

   }, [container, image]) 

  useEffect(() => {
    //console.log(container)
    if (image) {
      //obtainer image parent
      const marginleft = container?.getBoundingClientRect().left
      setTop(145 +image.offsetTop - (container?.scrollTop || 0));
      setLeft(image.offsetLeft + (marginleft || 0));
      setWidth(image.offsetWidth);
      setHeight(image.offsetHeight);
    }
    else {
      setTop(0);
      setLeft(0);
      setWidth(0);
      setHeight(0);
    }
  }, [image, container]);



  return (
    <div style={resizerStyle}>ImageResizer</div>
  )
}